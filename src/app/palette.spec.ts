import { TestBed, async } from '@angular/core/testing';

import { Palette } from './palette';

describe('AppComponent', () =>
{
    // beforeEach(async(() =>
    // {
    //     TestBed.configureTestingModule({
    //         declarations: [
    //             Palette
    //         ],
    //     }).compileComponents();
    // }));

    // it('should create the palette', async(() =>
    // {
    //     const fixture = TestBed.createComponent(Palette);
    //     const app = fixture.debugElement.componentInstance;
    //     expect(app).toBeTruthy();
    // }));

    it(`should have transparent at index 0`, async(() =>
    {
        let bytes: Uint8Array = new Uint8Array(30);
        bytes[0] = 0xFF;
        bytes[1] = 0xFF;
        bytes[2] = 0x0F;
        bytes[3] = 0x0F;
        let p = new Palette(bytes);
        expect(p.palette[0].A).toEqual(0);
    }));

    it(`should have white at index 1`, async(() =>
    {
        let bytes: Uint8Array = new Uint8Array(30);
        bytes[0] = 0xFF;
        bytes[1] = 0xFF;
        bytes[2] = 0x0F;
        bytes[3] = 0x0F;
        let p = new Palette(bytes);
        expect(p.palette[1].A).toEqual(255);
        expect(p.palette[1].R).toEqual(255);
        expect(p.palette[1].G).toEqual(255);
        expect(p.palette[1].B).toEqual(255);
    }));

    it(`should have other color at index 2`, async(() =>
    {
        let bytes: Uint8Array = new Uint8Array(30);
        bytes[0] = 0xFF;
        bytes[1] = 0xFF;
        bytes[2] = 0x0F;
        bytes[3] = 0x0F;
        let p = new Palette(bytes);
        expect(p.palette[2].A).toEqual(255);
        expect(p.palette[2].R).toEqual(123); // 01111 -> 15 / 31 * 255 = 123
        expect(p.palette[2].G).toEqual(197); // 11000 -> 24 / 31 * 255 = 197
        expect(p.palette[2].B).toEqual(25); // 00011 -> 3 / 31 * 255 = 25
    }));

    // it('should render title in a h1 tag', async(() =>
    // {
    //     const fixture = TestBed.createComponent(AppComponent);
    //     fixture.detectChanges();
    //     const compiled = fixture.debugElement.nativeElement;
    //     expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
    // }));
});
