import { describe, it, expect, beforeEach } from 'vitest';
import { PhonetogramService } from '../services/PhonetogramService';

describe('PhonetogramService', () => {
    let service;

    beforeEach(() => {
        service = new PhonetogramService();
    });

    it('should convert frequency to MIDI correctly', () => {
        expect(service.frequencyToMidi(440)).toBe(69); // A4
        expect(service.frequencyToMidi(261.63)).toBe(60); // C4
        expect(service.frequencyToMidi(0)).toBe(-1);
    });

    it('should add data points and track min/max', () => {
        // Add A4 at 60dB
        service.addDataPoint(440, 60);
        let data = service.getProfileData();
        expect(data).toHaveLength(1);
        expect(data[0].min).toBe(60);
        expect(data[0].max).toBe(60);

        // Add A4 at 80dB (should expand max)
        service.addDataPoint(440, 80);
        data = service.getProfileData();
        expect(data[0].min).toBe(60);
        expect(data[0].max).toBe(80);
        expect(data[0].range).toBe(20);

        // Add A4 at 50dB (should expand min)
        service.addDataPoint(440, 50);
        data = service.getProfileData();
        expect(data[0].min).toBe(50);
        expect(data[0].max).toBe(80);
    });

    it('should handle multiple pitches', () => {
        service.addDataPoint(261.63, 70); // C4
        service.addDataPoint(440, 75);    // A4

        const data = service.getProfileData();
        expect(data).toHaveLength(2);
        expect(data[0].note).toBe(60);
        expect(data[1].note).toBe(69);
    });

    it('should ignore invalid inputs', () => {
        service.addDataPoint(-100, 50);
        service.addDataPoint(440, -10);
        expect(service.getProfileData()).toHaveLength(0);
    });

    it('should clear data', () => {
        service.addDataPoint(440, 60);
        service.clear();
        expect(service.getProfileData()).toHaveLength(0);
        expect(service.minNote).toBe(127);
    });

    it('should export and import data', () => {
        service.addDataPoint(440, 60);
        service.addDataPoint(440, 80);

        const exported = service.export();

        const newService = new PhonetogramService();
        newService.import(exported);

        const data = newService.getProfileData();
        expect(data).toHaveLength(1);
        expect(data[0].min).toBe(60);
        expect(data[0].max).toBe(80);
    });
});
