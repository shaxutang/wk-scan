export enum RCode {
  SUCCESS = 200,
  FAIL = 400,
  ERROR = 500,
  DUPLICATE = 409,
}

export type ResultType<T = unknown> = {
  code: number
  message: string
  data: T
}

export class R<T = unknown> {
  private code: number
  private message: string
  private data: T = null

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  setCode(code: number) {
    this.code = code
    return this
  }

  setMessage(message: string) {
    this.message = message
    return this
  }

  setData(data: T) {
    this.data = data
    return this
  }

  getCode() {
    return this.code
  }

  getMessage() {
    return this.message
  }

  getData() {
    return this.data
  }

  public static success<T>() {
    return new R<T>().setCode(RCode.SUCCESS).setMessage('操作成功')
  }

  public static fail<T>(message: string) {
    return new R<T>().setCode(RCode.FAIL).setMessage(message)
  }

  public static error<T>() {
    return new R<T>().setCode(RCode.ERROR).setMessage('操作失败')
  }

  public static duplicate<T>() {
    return new R<T>()
      .setCode(RCode.DUPLICATE)
      .setMessage('操作失败，数据已存在')
  }
}
