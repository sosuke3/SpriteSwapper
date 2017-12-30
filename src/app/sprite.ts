import { Palette } from './palette';
import { Color } from './color';
import { TextEncoder, TextDecoder } from 'text-encoding';

export class Sprite
{
    public header: string;
    readonly headerOffset = 0;
    readonly headerLength = 4;

    public version: number;
    readonly versionOffset = this.headerOffset + this.headerLength;
    readonly versionLength = 1;
    readonly currentVersion = 1;

    public checkSum: number;
    readonly checksumOffset = this.versionOffset + this.versionLength;
    readonly checksumLength = 4;

    public hasValidChecksum: boolean;

    public pixelDataOffset: number;
    readonly pixelDataOffsetOffset = this.checksumOffset + this.checksumLength;
    readonly pixelDataOffsetLength = 4;

    public pixelDataLength: number;
    readonly pixelDataLengthOffset = this.pixelDataOffsetOffset + this.pixelDataOffsetLength;
    readonly pixelDataLengthLength = 2;

    public paletteDataOffset: number;
    readonly paletteDataOffsetOffset = this.pixelDataLengthOffset + this.pixelDataLengthLength;
    readonly paletteDataOffsetLength = 4;

    public paletteDataLength: number;
    readonly paletteDataLengthOffset = this.paletteDataOffsetOffset + this.paletteDataOffsetLength;
    readonly paletteDataLengthLength = 2;

    public spriteType: number;
    readonly spriteTypeOffset = this.paletteDataLengthOffset + this.paletteDataLengthLength;
    readonly spriteTypeLength = 2;

    readonly reservedOffset = this.spriteTypeOffset + this.spriteTypeLength;
    readonly reservedLength = 6;
    public reserved: Uint8Array = new Uint8Array(this.reservedLength);

    protected displayText: string;
    protected displayBytes: Uint8Array = null;

    public get DisplayText(): string
    {
        return this.displayText;
    }
    public set DisplayText(value: string)
    {
        this.displayText = value;
        /*
                displayBytes = Encoding.Unicode.GetBytes(displayText + '\0');
                displayBytesLength = (uint)displayBytes.Length;

                RecalculatePixelAndPaletteOffset();
        */
    }

    readonly displayTextOffset = this.reservedOffset + this.reservedLength;
    protected displayBytesLength: number;

    protected author: string;
    protected authorBytes: Uint8Array = null;

    public get Author(): string
    {
        return this.author;
    }
    public set Author(value: string)
    {
        this.author = value;
        /*
                authorBytes = Encoding.Unicode.GetBytes(author + '\0');
                authorBytesLength = (uint)authorBytes.Length;

                RecalculatePixelAndPaletteOffset();
        */
    }

    protected authorBytesLength: number;

    protected authorRomDisplay: string;
    protected authorRomDisplayBytes: Uint8Array;

    public get AuthorRomDisplay(): string
    {
        return this.authorRomDisplay;
    }
    public set AuthorRomDisplay(value: string)
    {
        if (value.length > 20)
        {
            value = value.substring(0, 20);
        }
        this.authorRomDisplay = value;

        /*
                authorRomDisplayBytes = Encoding.ASCII.GetBytes(authorRomDisplay + '\0');
                authorRomDisplayBytesLength = (uint)authorRomDisplayBytes.Length;

                RecalculatePixelAndPaletteOffset();
        */
    }

    protected pixelData: Uint8Array = null;
    public get PixelData(): Uint8Array
    {
        return this.pixelData;
    }
    public set PixelData(value: Uint8Array)
    {
        this.pixelData = value;

        /*
                RecalculatePixelAndPaletteOffset();
                BuildTileArray();
        */
    }
/*
        public void Set4bppPixelData(byte[] pixels)
        {
            this.pixelData = pixels;

            RecalculatePixelAndPaletteOffset();
            BuildTileArray();
        }
        public Tile8x8[] Tiles { get; protected set; }
*/

    protected paletteData: Uint8Array = null;
    public get PaletteData(): Uint8Array
    {
        return this.paletteData;
    }
    public set PaletteData(value: Uint8Array)
    {
        this.paletteData = value;
        /*
                RecalculatePixelAndPaletteOffset();
                RebuildPalette();
                BuildTileArray();
        */
    }

    /*
        public Color[] Palette { get; protected set; }
        public virtual void SetPalette(Color[] palette)
        {
            this.Palette = palette;

            RebuildPaletteData();
        }
    */

    public spriteBytes: Uint8Array = null;

    public previewBytes: Color[] = null;

    public greenPalette: Palette = null;
    public bluePalette: Palette = null;
    public redPalette: Palette = null;
    public bunnyPalette: Palette = null;

    public GlovePalette: Uint8Array = null;

    positions: number[] = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];

    constructor(rawData: Uint8Array)
    {
        let index: number;

        this.GlovePalette = new Uint8Array(4);
        // vanilla gloves
        this.GlovePalette[0] = 0xF6;
        this.GlovePalette[1] = 0x52;
        this.GlovePalette[2] = 0x76;
        this.GlovePalette[3] = 0x03;

        // why you no support proper constructor overloading.....
        if (rawData === null || rawData.length === 0)
        {
            this.version = 1;
            this.checkSum = 0xFFFF0000;
            this.pixelDataLength = 0x7000;
            this.paletteDataLength = 0x78;
            this.spriteType = 0;
            this.DisplayText = 'Unknown';
            this.Author = 'Unknown';
            this.AuthorRomDisplay = 'Unknown';
            this.pixelData = new Uint8Array(this.pixelDataLength);
            this.paletteData = new Uint8Array(this.paletteDataLength);

            //RebuildPalette();
            //BuildTileArray();

            return;
        }

        if (rawData.length === 0x7078)
        {
            // old headerless sprite file
            this.version = 0;
            this.checkSum = 0;
            this.spriteType = 1;
            this.DisplayText = '';
            this.Author = '';
            this.AuthorRomDisplay = '';
            this.pixelData = rawData.subarray(0, 0x7000);
            this.paletteData = rawData.subarray(0x7000, 0x7078);

            this.pixelDataLength = 0x7000;
            this.paletteDataLength = 0x78;

            //RebuildPalette();
            //BuildTileArray();

            this.spriteBytes = rawData.subarray(0, 0x7000);
            
            index = 0x7000;
            this.greenPalette = new Palette(rawData.subarray(index, index + 30));
            index += 30;
            this.bluePalette = new Palette(rawData.subarray(index, index + 30));
            index += 30;
            this.redPalette = new Palette(rawData.subarray(index, index + 30));
            index += 30;
            this.bunnyPalette = new Palette(rawData.subarray(index, index + 30));

            this.fillPreviewBytes();
            
            return;
        }

        if (rawData.length < this.headerLength + this.versionLength + this.checksumLength 
            + this.pixelDataOffsetLength + this.pixelDataLengthLength 
            + this.paletteDataOffsetLength + this.paletteDataLengthLength)
        {
            throw new Error('Invalid sprite file. Too short.');
        }
        if (false === this.IsZSprite(rawData))
        {
            throw new Error('Invalid sprite file. Wrong header.');
        }

        this.version = rawData[this.versionOffset];
        
        this.checkSum = this.bytesToUInt(rawData, this.checksumOffset);

        this.pixelDataOffset = this.bytesToUInt(rawData, this.pixelDataOffsetOffset);
        this.pixelDataLength = this.bytesToUShort(rawData, this.pixelDataLengthOffset);

        this.paletteDataOffset = this.bytesToUInt(rawData, this.paletteDataOffsetOffset);
        this.paletteDataLength = this.bytesToUShort(rawData, this.paletteDataLengthOffset);

        if (this.paletteDataLength % 2 !== 0)
        {
            throw new Error('Invalid sprite file. Palette size must be even.');
        }

        this.spriteType = this.bytesToUShort(rawData, this.spriteTypeOffset);

        this.reserved = rawData.subarray(this.reservedOffset, this.reservedOffset + this.reservedLength);

        let asciiDecoder = new TextDecoder('ascii');
        let utf16Decoder = new TextDecoder('utf-16');
        
        let endOfDisplay = this.GetNullTerminatorUnicodeLocation(rawData, this.displayTextOffset);
        let displayLength = endOfDisplay - this.displayTextOffset;
        if (displayLength > 0)
        {
            let displayTextBytes: Uint8Array = rawData.subarray(this.displayTextOffset, this.displayTextOffset + displayLength);
            this.DisplayText = utf16Decoder.decode(displayTextBytes); // Encoding.Unicode.GetString(displayTextBytes);
        }
        else
        { 
            this.DisplayText = '';
        }

        let authorTextOffset = endOfDisplay + 2;
        let endOfAuthor = this.GetNullTerminatorUnicodeLocation(rawData, authorTextOffset);
        let authorLength = endOfAuthor - authorTextOffset;
        if (authorLength > 0)
        {
            let authorTextBytes: Uint8Array = rawData.subarray(authorTextOffset, authorTextOffset + authorLength);
            this.Author = utf16Decoder.decode(authorTextBytes); // Encoding.Unicode.GetString(authorTextBytes);
        }
        else
        {
            this.Author = '';
        }

        let authorRomDisplayTextOffset = endOfAuthor + 2;
        let endOfAuthorRomDisplay = this.GetNullTerminatorAsciiLocation(rawData, authorRomDisplayTextOffset);
        let authorRomDisplayLength = endOfAuthorRomDisplay - authorRomDisplayTextOffset;
        if (authorRomDisplayLength > 0)
        {
            let authorRomDisplayTextBytes: Uint8Array = rawData.subarray(authorRomDisplayTextOffset, authorRomDisplayTextOffset + authorRomDisplayLength);
            this.AuthorRomDisplay = asciiDecoder.decode(authorRomDisplayTextBytes);
        }
        else
        {
            this.AuthorRomDisplay = '';
        }

        this.PixelData = rawData.subarray(this.pixelDataOffset, this.pixelDataOffset + this.pixelDataLength);
        this.PaletteData = rawData.subarray(this.paletteDataOffset, this.paletteDataOffset + this.paletteDataLength);

        //RebuildPalette();
        //BuildTileArray();

        this.hasValidChecksum = this.IsCheckSumValid();


        this.spriteBytes = this.pixelData;
        
        index = 0;
        this.greenPalette = new Palette(this.paletteData.subarray(index, index + 30));
        index += 30;
        this.bluePalette = new Palette(this.paletteData.subarray(index, index + 30));
        index += 30;
        this.redPalette = new Palette(this.paletteData.subarray(index, index + 30));
        index += 30;
        this.bunnyPalette = new Palette(this.paletteData.subarray(index, index + 30));
        index += 30;

        if (this.paletteData.length === 0x7C)
        {
            this.GlovePalette = this.paletteData.subarray(index, index + 4);
        }

        this.fillPreviewBytes();

    }

    public GetNullTerminatorUnicodeLocation(rawData: Uint8Array, offset: number): number
    {
        for (let i = offset; i < rawData.length; i += 2)
        {
            if (rawData[i] === 0 && i + 1 < rawData.length && rawData[i + 1] === 0)
            {
                return i;
            }
        }

        return offset;
    }

    public GetNullTerminatorAsciiLocation(rawData: Uint8Array, offset: number): number
    {
        for (let i = offset; i < rawData.length; i++)
        {
            if (rawData[i] === 0)
            {
                return i;
            }
        }

        return offset;
    }

    public IsZSprite(rawData: Uint8Array): boolean
    {
        if (rawData.length < 4 || rawData[0] !== 0x5A || rawData[1] !== 0x53 || rawData[2] !== 0x50 || rawData[3] !== 0x52)
        {
            return false;
        }

        return true;
    }

    protected bytesToUInt(bytes: Uint8Array, offset: number): number
    {
        //return BitConverter.ToUInt32(bytes, offset);
        return bytes[offset] | bytes[offset + 1] << 8 | bytes[offset + 2] << 16 | bytes[offset + 3] << 24;
    }

    protected bytesToUShort(bytes: Uint8Array, offset: number): number
    {
        //return BitConverter.ToUInt16(bytes, offset);
        return bytes[offset] | bytes[offset + 1] << 8;
    }

    protected UIntToBytes(int: number): Uint8Array
    {
        let ret: Uint8Array = new Uint8Array(4);
        ret[0] = (int) & 0xFF;
        ret[1] = (int >> 8) & 0xFF;
        ret[2] = (int >> 16) & 0xFF;
        ret[3] = (int >> 24) & 0xFF;
        return ret;
    }

    public IsCheckSumValid(): boolean
    {
        return true;

        // TODO: implement this

        // let storedChecksum: Uint8Array = this.UIntToBytes(this.checkSum);
        // let checksum: Uint8Array = new Uint8Array(4);
        // checksum[0] = 0x00;
        // checksum[1] = 0x00;
        // checksum[2] = 0xFF;
        // checksum[3] = 0xFF;

        // byte[] bytes = this.ToByteArray(true);
        // int sum = 0;
        // for (int i = 0; i < bytes.Length; i++)
        // {
        //     sum += bytes[i];
        // }

        // checksum[0] = (byte)(sum & 0xFF);
        // checksum[1] = (byte)((sum >> 8) & 0xFF);

        // int complement = (sum & 0xFFFF) ^ 0xFFFF;
        // checksum[2] = (byte)(complement & 0xFF);
        // checksum[3] = (byte)((complement >> 8) & 0xFF);

        // return (storedChecksum[0] == checksum[0] 
        //     && storedChecksum[1] == checksum[1] 
        //     && storedChecksum[2] == checksum[2] 
        //     && storedChecksum[3] == checksum[3]);
    }

    public isValidSprite(): boolean
    {
        return true;
    }

    drawSpritePreview(canvas)
    {
        let context: CanvasRenderingContext2D = canvas.getContext('2d');
        
        let imgData = context.getImageData(0, 0, 16 * 3 * 2, 24 * 2);

        for (let x = 0; x < 16 * 3; x++)
        {
            for (let y = 0; y < 24; y++)
            {
                let pixel = this.previewBytes[x + y * (16 * 3)];

                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 0) * imgData.width * 4] = pixel.R;
                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 0) * imgData.width * 4 + 1] = pixel.G;
                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 0) * imgData.width * 4 + 2] = pixel.B;
                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 0) * imgData.width * 4 + 3] = pixel.A;

                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 0) * imgData.width * 4] = pixel.R;
                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 0) * imgData.width * 4 + 1] = pixel.G;
                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 0) * imgData.width * 4 + 2] = pixel.B;
                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 0) * imgData.width * 4 + 3] = pixel.A;

                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 1) * imgData.width * 4] = pixel.R;
                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 1) * imgData.width * 4 + 1] = pixel.G;
                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 1) * imgData.width * 4 + 2] = pixel.B;
                imgData.data[(x * 2 + 0) * 4 + (y * 2 + 1) * imgData.width * 4 + 3] = pixel.A;

                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 1) * imgData.width * 4] = pixel.R;
                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 1) * imgData.width * 4 + 1] = pixel.G;
                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 1) * imgData.width * 4 + 2] = pixel.B;
                imgData.data[(x * 2 + 1) * 4 + (y * 2 + 1) * imgData.width * 4 + 3] = pixel.A;
            }
        }

        context.putImageData(imgData, 0, 0);
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
