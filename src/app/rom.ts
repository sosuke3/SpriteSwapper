export class Rom
{
    public romBytes: Uint8Array = null;

    constructor(bytes: Uint8Array) 
    {
        this.romBytes = bytes;
    }

    public isValidRom (): boolean
    {
        if (this.romBytes.length !== 0x100000
            && this.romBytes.length !== 0x200000
            && this.romBytes.length !== 0x300000
            && this.romBytes.length !== 0x400000)
        {
            return false;
        }

        return true;
    }

}
