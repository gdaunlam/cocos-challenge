import { promises as fs } from 'fs';
import { join } from 'path';
import { Instrument } from '../../interfaces/instrument.interface';

export class InstrumentsRepository {
  private readonly filePath = join(process.cwd(), 'data', 'instruments.json');

  async findAll(): Promise<Instrument[]> {
    const data = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  async save(instruments: Instrument[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(instruments, null, 2));
  }
}