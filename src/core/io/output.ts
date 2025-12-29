export interface OutputPort {
  info(message: string): void
  error(message: string): void
}

export class ConsoleOutput implements OutputPort {
  public info(message: string): void {
    console.log(message)
  }

  public error(message: string): void {
    console.error(message)
  }
}
