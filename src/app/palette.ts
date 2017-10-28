import { Color } from './color';


export class Palette
{
    public paletteBytes: Uint8Array;
    public palette: Color[];

    constructor(bytes: Uint8Array) 
    {
        this.paletteBytes = bytes;

        this.palette = new Array(16);

        let transparent = new Color();
        transparent.A = 0x0;
        transparent.R = 0xFF;
        transparent.G = 0xFF;
        transparent.B = 0xFF;
        this.palette[0] = transparent;

        for (let i = 0; i < 30; i += 2)
        {
            let c = this.paletteBytes[i] | (this.paletteBytes[i + 1] << 8);
            let r = (c & 0x1F);
            let g = (c >> 5) & 0x1F;
            let b = (c >> 10) & 0x1F;

            let p = new Color();
            p.A = 255;
            p.R = Math.round((r / 0x1F) * 0xFF);
            p.G = Math.round((g / 0x1F) * 0xFF);
            p.B = Math.round((b / 0x1F) * 0xFF);

            this.palette[i / 2 + 1] = p;
        }
    }

}
