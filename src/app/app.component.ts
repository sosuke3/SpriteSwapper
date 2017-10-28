import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';

import { Sprite } from './sprite';

interface HTMLInputEvent extends Event
{
    target: HTMLInputElement & EventTarget;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent
{
    romBytes: Uint8Array = null;
    romFilename = '';
    spriteBytes: Uint8Array = null;
    spriteFilename = '';
    sprite: Sprite = null;
    romError = '';
    spriteError = '';

    context: CanvasRenderingContext2D;
    
    @ViewChild('spriteCanvas') spriteCanvas;
    
    onRomChange (event?: HTMLInputEvent)
    {
        console.log('onRomChange');
        let files = event.target.files;
        if (files.length === 0)
        {
            return;
        }

        this.romError = '';
        this.romFilename = files[0].name;

        let reader = new FileReader();
        reader.onload = () =>
        {
            let arrayBuffer = reader.result;
            let array = new Uint8Array(arrayBuffer);
            this.romBytes = array;
            //let binaryString = String.fromCharCode.apply(null, array);
            //console.log(binaryString);
            if (!this.isValidRom(this.romBytes))
            {
                this.romError = 'Invalid rom file';
                return;
            }
        };

        reader.readAsArrayBuffer(files[0]);

        console.log(files);
    }

    onSpriteChange (event?: HTMLInputEvent)
    {
        console.log('onSpriteChange');
        let files = event.target.files;
        if (files.length === 0)
        {
            return;
        }

        this.spriteError = '';
        this.spriteFilename = files[0].name;

        let reader = new FileReader();
        reader.onload = () =>
        {
            let arrayBuffer = reader.result;
            let array = new Uint8Array(arrayBuffer);

            try
            {
                this.sprite = new Sprite(array);
            }
            catch (e)
            {
                this.spriteError = e.message;
                return;
            }

            let canvas = this.spriteCanvas.nativeElement;
            this.context = canvas.getContext('2d');
            
            let imgData = this.context.getImageData(0, 0, 16 * 3, 24);

            for (let x = 0; x < 16; x++)
            {
                for (let y = 0; y < 24; y++)
                {
                    let pixel = this.sprite.previewBytes[x + y * (16 * 3)];
                    imgData.data[x * 4 + y * imgData.width * 4] = pixel.R;
                    imgData.data[x * 4 + y * imgData.width * 4 + 1] = pixel.G;
                    imgData.data[x * 4 + y * imgData.width * 4 + 2] = pixel.B;
                    imgData.data[x * 4 + y * imgData.width * 4 + 3] = pixel.A;
                }
            }

            for (let x = 0; x < 16; x++)
            {
                for (let y = 0; y < 24; y++)
                {
                    let pixel = this.sprite.previewBytes[(x + 16) + y * (16 * 3)];
                    imgData.data[(x + 16) * 4 + y * imgData.width * 4] = pixel.R;
                    imgData.data[(x + 16) * 4 + y * imgData.width * 4 + 1] = pixel.G;
                    imgData.data[(x + 16) * 4 + y * imgData.width * 4 + 2] = pixel.B;
                    imgData.data[(x + 16) * 4 + y * imgData.width * 4 + 3] = pixel.A;
                }
            }

            for (let x = 0; x < 16; x++)
            {
                for (let y = 0; y < 24; y++)
                {
                    let pixel = this.sprite.previewBytes[(x + 32) + y * (16 * 3)];
                    imgData.data[(x + 32) * 4 + y * imgData.width * 4] = pixel.R;
                    imgData.data[(x + 32) * 4 + y * imgData.width * 4 + 1] = pixel.G;
                    imgData.data[(x + 32) * 4 + y * imgData.width * 4 + 2] = pixel.B;
                    imgData.data[(x + 32) * 4 + y * imgData.width * 4 + 3] = pixel.A;
                }
            }

            // for (let i = 0; i < imgData.data.length / 4; i++)
            // {
            //     let pixel = this.sprite.previewBytes[i];
            //     imgData.data[i * 4] = pixel.R;
            //     imgData.data[i * 4 + 1] = pixel.G;
            //     imgData.data[i * 4 + 2] = pixel.B;
            //     imgData.data[i * 4 + 3] = pixel.A;
            // }
            this.context.putImageData(imgData, 0, 0);
        
            this.spriteBytes = array;
            //let binaryString = String.fromCharCode.apply(null, array);
            //console.log(binaryString);
            if (!this.isValidSprite(this.spriteBytes))
            {
                this.spriteError = 'Invalid sprite file';
                return;
            }
        };

        reader.readAsArrayBuffer(files[0]);

        console.log(files);
    }

    isValidRom (rom: Uint8Array): boolean
    {
        if (rom.length !== 0x100000
            && this.romBytes.length !== 0x200000
            && this.romBytes.length !== 0x300000
            && this.romBytes.length !== 0x400000)
        {
            return false;
        }

        return true;
    }

    isValidSprite (sprite: Uint8Array): boolean
    {
        if (sprite.length !== 0x7078)
        {
            return false;
        }

        return true;
    }

    onSaveRom ()
    {
        let hasError = false;
        this.spriteError = '';
        this.romError = '';

        if (!this.isValidSprite(this.spriteBytes))
        {
            console.log('Invalid sprite file.');
            this.spriteError = 'Invalid sprite file.';
            hasError = true;
        }
        if (!this.isValidRom(this.romBytes))
        {
            console.log('Invalid rom file.');
            this.romError = 'Invalid rom file.';
            hasError = true;
        }

        if (hasError)
        {
            return;
        }

        // sprite graphics
        for (let i = 0; i < 0x7000; i++)
        {
            this.romBytes[0x80000 + i] = this.spriteBytes[i];
        }
        // palette
        for (let i = 0; i < 0x78; i++)
        {
            this.romBytes[0x0DD308 + i] = this.spriteBytes[0x7000 + i];
        }
        // gloves color
        this.romBytes[0xDEDF5] = this.spriteBytes[0x7036];
        this.romBytes[0xDEDF6] = this.spriteBytes[0x7037];
        this.romBytes[0xDEDF7] = this.spriteBytes[0x7054];
        this.romBytes[0xDEDF8] = this.spriteBytes[0x7055];

        this.downloadBlob(this.romBytes, this.romFilename, 'application/octet-stream');
    }

    downloadBlob = (data, fileName, mimeType) =>
    {
        let blob, url;
        blob = new Blob([data], {
            type: mimeType
        });
        url = window.URL.createObjectURL(blob);
        this.downloadURL(url, fileName);
        setTimeout(function ()
        {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    }

    downloadURL = (data, fileName) =>
    {
        let a;
        a = document.createElement('a');
        a.href = data;
        a.download = fileName;
        document.body.appendChild(a);
        a.style = 'display: none';
        a.click();
        a.remove();
    }
}
