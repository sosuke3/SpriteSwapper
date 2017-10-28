import { Palette } from './palette';
import { Color } from './color';

export class Sprite
{
    public spriteBytes: Uint8Array = null;

    public previewBytes: Color[] = null;

    public greenPalette: Palette = null;
    public bluePalette: Palette = null;
    public redPalette: Palette = null;
    public bunnyPalette: Palette = null;

    positions: number[] = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];
    
    constructor(bytes: Uint8Array)
    {
        if (bytes.length !== 0x7078)
        {
            throw new Error('Not a valid sprite');
        }

        this.spriteBytes = bytes.subarray(0, 0x7000);

        let index = 0x7000;
        this.greenPalette = new Palette(bytes.subarray(index, index + 30));
        index += 30;
        this.bluePalette = new Palette(bytes.subarray(index, index + 30));
        index += 30;
        this.redPalette = new Palette(bytes.subarray(index, index + 30));
        index += 30;
        this.bunnyPalette = new Palette(bytes.subarray(index, index + 30));

        this.fillPreviewBytes();
    }

    fillPreviewBytes()
    {
        this.previewBytes = new Array(16 * 3 * 24);
        for (let i = 0; i < this.previewBytes.length; i++)
        {
            let color = new Color;
            color.A = 0;
            color.R = 0;
            color.G = 0;
            color.B = 0;
            this.previewBytes[i] = color;
        }

        // load body
        let body = this.load16x16(0x4C0);
        for (let x = 0; x < 16; x++)
        {
            for (let y = 0; y < 16; y++)
            {
                this.previewBytes[x + ((y + 8) * 16 * 3)] = this.greenPalette.palette[body[x + y * 16]];

                this.previewBytes[(x + 16) + ((y + 8) * 16 * 3)] = this.bluePalette.palette[body[x + y * 16]];

                this.previewBytes[(x + 32) + ((y + 8) * 16 * 3)] = this.redPalette.palette[body[x + y * 16]];
            }
        }

        let head = this.load16x16(0x40);
        for (let x = 0; x < 16; x++)
        {
            for (let y = 0; y < 16; y++)
            {
                if (head[x + y * 16] !== 0)
                {
                    this.previewBytes[x + (y * 16 * 3)] = this.greenPalette.palette[head[x + y * 16]];
                    this.previewBytes[(x + 16) + (y * 16 * 3)] = this.bluePalette.palette[head[x + y * 16]];
                    this.previewBytes[(x + 32) + (y * 16 * 3)] = this.redPalette.palette[head[x + y * 16]];
                }
            }
        }
    }

    load16x16(pos: number): Uint8Array
    {
        let tempArray = new Uint8Array(16 * 16); // 16 * 16

        let topLeft = this.load8x8(pos);
        let topRight = this.load8x8(pos + 0x20);
        let bottomLeft = this.load8x8(pos + 0x200);
        let bottomRight = this.load8x8(pos + 0x220);
        
        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                tempArray[(x + 0) + ((y + 0) * 16)] = topLeft[x + y * 8];
                tempArray[(x + 8) + ((y + 0) * 16)] = topRight[x + y * 8];
                tempArray[(x + 0) + ((y + 8) * 16)] = bottomLeft[x + y * 8];
                tempArray[(x + 8) + ((y + 8) * 16)] = bottomRight[x + y * 8];
            }
        }

        return tempArray;
    }
    load8x8(pos: number): Uint8Array
    {
        let tempArray = new Uint8Array(64);

        let offset = pos;

        for (let x = 0; x < 8; x++)
        {
            for (let y = 0; y < 8; y++)
            {
                let tempByte = 0;

                if ((this.spriteBytes[offset + (x * 2)] & this.positions[y]) === this.positions[y]) 
                { 
                    tempByte += 1;
                }
                if ((this.spriteBytes[offset + (x * 2) + 1] & this.positions[y]) === this.positions[y]) 
                { 
                    tempByte += 2;
                }
                if ((this.spriteBytes[offset + 16 + (x * 2)] & this.positions[y]) === this.positions[y]) 
                { 
                    tempByte += 4;
                }
                if ((this.spriteBytes[offset + 16 + (x * 2) + 1] & this.positions[y]) === this.positions[y]) 
                { 
                    tempByte += 8;
                }
                tempArray[y + (x * 8)] = tempByte;
            }
        }

        return tempArray;
    }
}
