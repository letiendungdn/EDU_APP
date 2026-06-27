{{/*
Expand the name of the chart.
*/}}
{{- define "edu-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "edu-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "edu-app.labels" -}}
helm.sh/chart: {{ include "edu-app.name" . }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: edu-platform
{{- end }}

{{/*
Selector labels for a component
*/}}
{{- define "edu-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "edu-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Image reference for a service
*/}}
{{- define "edu-app.image" -}}
{{- printf "%s/%s/%s:%s" .Values.image.registry .Values.image.repository .service .Values.image.tag }}
{{- end }}

{{/*
ConfigMap name
*/}}
{{- define "edu-app.configMapName" -}}
edu-app-config
{{- end }}

{{/*
Secret name
*/}}
{{- define "edu-app.secretName" -}}
edu-app-secrets
{{- end }}

{{/*
Namespace
*/}}
{{- define "edu-app.namespace" -}}
{{- .Values.namespace }}
{{- end }}
