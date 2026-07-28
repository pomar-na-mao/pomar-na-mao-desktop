import { Pipe, PipeTransform } from '@angular/core';

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

@Pipe({
  name: 'severityLabel',
})
export class SeverityLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return SEVERITY_LABELS[value.trim().toLowerCase()] ?? value;
  }
}
