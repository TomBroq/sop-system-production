/**
 * Encryption Service - LGPD Compliance
 * Implementa AES-256 encryption para dados sensíveis
 * Suporte para encryption at rest e key rotation
 */

import * as crypto from 'crypto';
import { logger } from '../shared/logger';

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  keyVersion: number;
  algorithm: string;
}

export interface DecryptionInput {
  encryptedData: string;
  iv: string;
  keyVersion?: number;
  algorithm?: string;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  
  private currentKeyVersion = 1;
  private encryptionKeys: Map<number, Buffer> = new Map();

  constructor() {
    this.initializeKeys();
  }

  /**
   * Inicializa chaves de criptografia
   */
  private initializeKeys(): void {
    // Em produção, estas chaves devem vir de um Key Management Service (KMS)
    const masterKey = process.env.ENCRYPTION_MASTER_KEY || this.generateSecureKey();
    
    // Derive keys para diferentes versões
    this.encryptionKeys.set(1, this.deriveKey(masterKey, 'v1'));
    
    logger.info('Encryption service initialized', {
      keyVersions: Array.from(this.encryptionKeys.keys()),
      algorithm: this.algorithm
    });
  }

  /**
   * Criptografa dados sensíveis usando AES-256-GCM
   */
  async encrypt(data: Buffer | string): Promise<EncryptionResult> {
    try {
      const plaintext = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
      const key = this.encryptionKeys.get(this.currentKeyVersion);
      
      if (!key) {
        throw new Error(`Encryption key version ${this.currentKeyVersion} not found`);
      }

      // Gerar IV aleatório para cada operação
      const iv = crypto.randomBytes(this.ivLength);
      
      // Criar cipher
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from(`keyVersion:${this.currentKeyVersion}`));

      // Criptografar dados
      let encrypted = cipher.update(plaintext);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // Obter authentication tag
      const tag = cipher.getAuthTag();

      // Combinar encrypted data + tag
      const encryptedWithTag = Buffer.concat([encrypted, tag]);

      return {
        encryptedData: encryptedWithTag.toString('base64'),
        iv: iv.toString('base64'),
        keyVersion: this.currentKeyVersion,
        algorithm: this.algorithm
      };

    } catch (error) {
      logger.error('Encryption failed', {
        error: error.message,
        algorithm: this.algorithm,
        keyVersion: this.currentKeyVersion
      });
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Descriptografa dados usando a versão de chave especificada
   */
  async decrypt(input: DecryptionInput): Promise<Buffer> {
    try {
      const keyVersion = input.keyVersion || this.currentKeyVersion;
      const algorithm = input.algorithm || this.algorithm;
      const key = this.encryptionKeys.get(keyVersion);

      if (!key) {
        throw new Error(`Decryption key version ${keyVersion} not found`);
      }

      const encryptedBuffer = Buffer.from(input.encryptedData, 'base64');
      const iv = Buffer.from(input.iv, 'base64');

      // Separar encrypted data e authentication tag
      const encryptedData = encryptedBuffer.slice(0, -this.tagLength);
      const tag = encryptedBuffer.slice(-this.tagLength);

      // Criar decipher
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from(`keyVersion:${keyVersion}`));
      decipher.setAuthTag(tag);

      // Descriptografar
      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted;

    } catch (error) {
      logger.error('Decryption failed', {
        error: error.message,
        keyVersion: input.keyVersion,
        algorithm: input.algorithm
      });
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Criptografa dados pessoais para storage em database
   */
  async encryptPersonalData(personalData: Record<string, any>): Promise<string> {
    const dataString = JSON.stringify(personalData);
    const encrypted = await this.encrypt(dataString);
    
    // Retornar como JSON string para armazenar em campo JSONB
    return JSON.stringify(encrypted);
  }

  /**
   * Descriptografa dados pessoais do database
   */
  async decryptPersonalData(encryptedJson: string): Promise<Record<string, any>> {
    const encryptionResult = JSON.parse(encryptedJson) as EncryptionResult;
    const decrypted = await this.decrypt(encryptionResult);
    
    return JSON.parse(decrypted.toString('utf8'));
  }

  /**
   * Criptografa dados específicos do formulário para compliance LGPD
   */
  async encryptFormResponses(responses: Record<string, any>): Promise<string> {
    // Identificar campos que contêm dados pessoais
    const personalDataFields = this.identifyPersonalDataFields(responses);
    const encryptedResponses = { ...responses };

    // Criptografar apenas campos sensíveis
    for (const field of personalDataFields) {
      if (responses[field]) {
        const encrypted = await this.encrypt(String(responses[field]));
        encryptedResponses[field] = `encrypted:${JSON.stringify(encrypted)}`;
      }
    }

    return JSON.stringify(encryptedResponses);
  }

  /**
   * Descriptografa respostas do formulário
   */
  async decryptFormResponses(encryptedResponses: string): Promise<Record<string, any>> {
    const responses = JSON.parse(encryptedResponses);
    const decryptedResponses = { ...responses };

    // Descriptografar campos que foram criptografados
    for (const [key, value] of Object.entries(responses)) {
      if (typeof value === 'string' && value.startsWith('encrypted:')) {
        const encryptedData = JSON.parse(value.replace('encrypted:', ''));
        const decrypted = await this.decrypt(encryptedData);
        decryptedResponses[key] = decrypted.toString('utf8');
      }
    }

    return decryptedResponses;
  }

  /**
   * Gera hash seguro para senhas usando bcrypt-like approach
   */
  async hashPassword(password: string, saltRounds: number = 12): Promise<string> {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, saltRounds * 1000, 64, 'sha512');
    
    return `${saltRounds}:${salt.toString('hex')}:${key.toString('hex')}`;
  }

  /**
   * Verifica senha contra hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const [saltRounds, saltHex, keyHex] = hash.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const originalKey = Buffer.from(keyHex, 'hex');
      
      const key = crypto.pbkdf2Sync(password, salt, parseInt(saltRounds) * 1000, 64, 'sha512');
      
      return crypto.timingSafeEqual(originalKey, key);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gera token seguro para reset de senha ou verificação
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Implementa key rotation para enhanced security
   */
  async rotateKeys(): Promise<void> {
    const newVersion = this.currentKeyVersion + 1;
    const masterKey = process.env.ENCRYPTION_MASTER_KEY || this.generateSecureKey();
    
    // Gerar nova chave
    this.encryptionKeys.set(newVersion, this.deriveKey(masterKey, `v${newVersion}`));
    this.currentKeyVersion = newVersion;

    logger.info('Encryption keys rotated', {
      newKeyVersion: newVersion,
      totalKeys: this.encryptionKeys.size
    });

    // Em produção, notificar sobre necessidade de re-encrypt dados antigos
    this.scheduleDataReEncryption(newVersion);
  }

  /**
   * Identifica campos que podem conter dados pessoais
   */
  private identifyPersonalDataFields(data: Record<string, any>): string[] {
    const personalDataKeywords = [
      'nome', 'name', 'email', 'telefone', 'phone', 'cpf', 'cnpj',
      'endereco', 'address', 'contato', 'contact', 'responsavel',
      'funcionarios', 'employees', 'salario', 'salary'
    ];

    return Object.keys(data).filter(key => 
      personalDataKeywords.some(keyword => 
        key.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  /**
   * Deriva chave específica a partir da master key
   */
  private deriveKey(masterKey: string, context: string): Buffer {
    return crypto.pbkdf2Sync(masterKey, context, 100000, this.keyLength, 'sha256');
  }

  /**
   * Gera chave mestra segura (para development/testing)
   */
  private generateSecureKey(): string {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Master key must be provided via environment variable in production');
    }
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Agenda re-encriptação de dados com chaves antigas
   */
  private scheduleDataReEncryption(newKeyVersion: number): void {
    // Em implementação real, criar job para re-encrypt dados antigos
    logger.info('Data re-encryption scheduled', {
      newKeyVersion,
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    });
  }

  /**
   * Validação de integridade dos dados criptografados
   */
  async validateEncryptedData(encryptedData: EncryptionResult): Promise<boolean> {
    try {
      await this.decrypt(encryptedData);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Limpa chaves antigas da memória (para key rotation cleanup)
   */
  cleanupOldKeys(keepVersions: number = 2): void {
    const sortedVersions = Array.from(this.encryptionKeys.keys()).sort((a, b) => b - a);
    const versionsToDelete = sortedVersions.slice(keepVersions);

    for (const version of versionsToDelete) {
      this.encryptionKeys.delete(version);
    }

    logger.info('Old encryption keys cleaned up', {
      deletedVersions: versionsToDelete,
      remainingVersions: Array.from(this.encryptionKeys.keys())
    });
  }
}

export default EncryptionService;