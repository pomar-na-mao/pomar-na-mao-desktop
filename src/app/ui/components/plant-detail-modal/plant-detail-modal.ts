import {
    Component,
    Input,
    Output,
    EventEmitter,
    HostListener,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { occurenceKeys, occurencesLabels } from '../../../shared/utils/occurrences';
import type { Plant, PlantRecentUpdate } from '../../../domain/models/plant-data.model';
 
export type PlantDetailInput = Plant | PlantRecentUpdate;
 
@Component({
    selector: 'app-plant-detail-modal',
    standalone: true,
    imports: [CommonModule, TranslateModule, TitleCasePipe, TimeAgoPipe],
    templateUrl: './plant-detail-modal.html',
    styleUrls: ['./plant-detail-modal.scss'],
})
export class PlantDetailModalComponent {
    @Input() plant: PlantDetailInput | null = null;
    @Output() closed = new EventEmitter<void>();
 
    public readonly occurenceKeys = occurenceKeys;
    public readonly occurencesLabels = occurencesLabels;
 
    @HostListener('document:keydown.escape')
    public onEscapeKey(): void {
        this.close();
    }
 
    public close(): void {
        this.closed.emit();
    }
 
    public onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.close();
        }
    }
 
    public get activeOccurrences(): string[] {
        if (!this.plant) return [];
        return occurenceKeys.filter(
            (key) => ((this.plant as unknown) as Record<string, unknown>)[key] === true
        );
    }
 
    public get formattedId(): string {
        return this.plant?.id?.split('-')[0] ?? '';
    }
 
    public get occurrenceCount(): number {
        return this.activeOccurrences.length;
    }
 
    public get statusLevel(): 'healthy' | 'moderate' | 'critical' {
        if (this.occurrenceCount === 0) return 'healthy';
        if (this.occurrenceCount <= 2) return 'moderate';
        return 'critical';
    }
 
    public get plantingDate(): string | null {
        return ((this.plant as unknown) as Plant)?.planting_date ?? null;
    }
 
    public get lifeOfTree(): string | null {
        return ((this.plant as unknown) as Plant)?.life_of_the_tree ?? null;
    }
 
    public get latitude(): number | null {
        return ((this.plant as unknown) as Plant)?.latitude ?? null;
    }
 
    public get longitude(): number | null {
        return ((this.plant as unknown) as Plant)?.longitude ?? null;
    }
 
    public get hasLocationData(): boolean {
        return this.latitude !== null && this.longitude !== null;
    }
}