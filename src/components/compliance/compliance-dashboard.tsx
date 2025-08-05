/**
 * LGPD Compliance Dashboard
 * Dashboard em tempo real para monitoramento de compliance
 * Métricas, alertas e relatórios automáticos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, Shield, Users, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ComplianceMetrics {
  consentimentos_ativos: number;
  solicitacoes_direitos_pendentes: number;
  incidents_mes: number;
  score_compliance: number;
  prazo_medio_resposta_horas: number;
  dados_processados_hoje: number;
  backups_realizados_hoje: number;
  certificacoes_validas: number;
}

interface ComplianceAlert {
  id: string;
  type: 'prazo_vencendo' | 'violacao_acesso' | 'anomalia_processamento' | 'certificacao_expirando';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  created_at: Date;
  acknowledged: boolean;
}

interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at: Date;
  deadline: Date;
  requester_email: string;
}

export function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    consentimentos_ativos: 0,
    solicitacoes_direitos_pendentes: 0,
    incidents_mes: 0,
    score_compliance: 0,
    prazo_medio_resposta_horas: 0,
    dados_processados_hoje: 0,
    backups_realizados_hoje: 0,
    certificacoes_validas: 0
  });

  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [dataSubjectRequests, setDataSubjectRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadComplianceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      // Implementar chamadas para APIs de compliance
      const [metricsData, alertsData, requestsData] = await Promise.all([
        fetch('/api/compliance/metrics').then(r => r.json()),
        fetch('/api/compliance/alerts').then(r => r.json()),
        fetch('/api/compliance/data-subject-requests').then(r => r.json())
      ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
      setDataSubjectRequests(requestsData);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.medium;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4 text-yellow-500" />,
      processing: <AlertCircle className="h-4 w-4 text-blue-500" />,
      completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      rejected: <XCircle className="h-4 w-4 text-red-500" />
    };
    return icons[status] || icons.pending;
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/compliance/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const generateComplianceReport = async () => {
    try {
      const response = await fetch('/api/compliance/reports/generate', {
        method: 'POST'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard LGPD Compliance</h1>
          <p className="text-gray-600">Monitoramento em tempo real de conformidade com LGPD</p>
        </div>
        <Button onClick={generateComplianceReport} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold p-2 rounded-lg ${getComplianceScoreColor(metrics.score_compliance)}`}>
              {metrics.score_compliance}%
            </div>
            <p className="text-xs text-muted-foreground">
              Conformidade geral LGPD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.solicitacoes_direitos_pendentes}</div>
            <p className="text-xs text-muted-foreground">
              Direitos dos titulares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes (30 dias)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.incidents_mes}</div>
            <p className="text-xs text-muted-foreground">
              Incidentes de segurança
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.prazo_medio_resposta_horas}h</div>
            <p className="text-xs text-muted-foreground">
              Processamento de direitos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Compliance
          </CardTitle>
          <CardDescription>
            Alertas que requerem atenção imediata para manter conformidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              Nenhum alerta ativo - Sistema em conformidade
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    alert.acknowledged ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-500">
                        {alert.created_at.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Reconhecer
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solicitações de Direitos dos Titulares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Solicitações de Direitos LGPD
          </CardTitle>
          <CardDescription>
            Acompanhamento de solicitações dos titulares de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataSubjectRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma solicitação pendente
            </div>
          ) : (
            <div className="space-y-4">
              {dataSubjectRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium">
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)} - {request.requester_email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Criado: {request.created_at.toLocaleDateString('pt-BR')} | 
                        Prazo: {request.deadline.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      request.status === 'completed' ? 'default' :
                      request.status === 'rejected' ? 'destructive' :
                      new Date() > request.deadline ? 'destructive' : 'secondary'
                    }>
                      {request.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Consentimentos Ativos:</span>
              <span className="font-bold">{metrics.consentimentos_ativos}</span>
            </div>
            <div className="flex justify-between">
              <span>Dados Processados Hoje:</span>
              <span className="font-bold">{metrics.dados_processados_hoje}</span>
            </div>
            <div className="flex justify-between">
              <span>Backups Realizados:</span>
              <span className="font-bold text-green-600">{metrics.backups_realizados_hoje}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Certificações Válidas:</span>
              <span className="font-bold text-green-600">{metrics.certificacoes_validas}/4</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">LGPD Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Vendor Certifications</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Portal do Titular
            </Button>
            <Button className="w-full" variant="outline">
              Configurar Alertas
            </Button>
            <Button className="w-full" variant="outline">
              Audit Logs
            </Button>
            <Button className="w-full" variant="outline">
              Relatórios DPO
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ComplianceDashboard;