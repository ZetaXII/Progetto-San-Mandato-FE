import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    const html = value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // grassetto
      .replace(/_(.*?)_/g, '<em>$1</em>')               // corsivo
      .replace(/\n/g, '<br>');                          // a capo
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}