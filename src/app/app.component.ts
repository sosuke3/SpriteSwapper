import { Component } from '@angular/core';

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
    romError = '';
    spriteError = '';

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

        for (let i = 0; i < 0x7000; i++)
        {
            this.romBytes[0x80000 + i] = this.spriteBytes[i];
        }
        for (let i = 0; i < 0x78; i++)
        {
            this.romBytes[0x0DD308 + i] = this.spriteBytes[0x7000 + i];
        }

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
