import {
    Component,
    Input,
    Output,
    EventEmitter,
    HostListener,
    inject,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme/theme.service';
import { occurenceKeys, occurencesLabels } from '../../../shared/utils/occurrences';
import type { Plant, PlantRecentUpdate } from '../../../domain/models/plant-data.model';

export type PlantDetailInput = Plant | PlantRecentUpdate;

@Component({
    selector: 'app-plant-detail-modal',
    standalone: true,
    imports: [CommonModule, TranslateModule, TitleCasePipe],
    templateUrl: './plant-detail-modal.html',
    styleUrls: ['./plant-detail-modal.scss'],
})
export class PlantDetailModalComponent {
    @Input() plant: PlantDetailInput | null = null;
    @Output() closed = new EventEmitter<void>();

    private themeService = inject(ThemeService);

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

    public get isDark(): boolean {
        return this.themeService.currentTheme() === 'dark';
    }

    public get formattedUpdatedAt(): string {
        if (!this.plant) return '';
        const updatedAt = (this.plant as unknown as Plant)?.updated_at || (this.plant as unknown as PlantRecentUpdate)?.updated_at;
        return this.formatDate(updatedAt);
    }

    public get formattedPlantingDate(): string | null {
        const date = this.plantingDate;
        if (!date) return null;
        return this.formatDate(date);
    }

    private formatDate(dateString: string): string {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return '';
        }
    }
}