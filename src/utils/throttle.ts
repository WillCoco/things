/**
 * 节流函数
 * @param fun
 * @param delay
 */

export default function (fun: Function, delay?: number) {
  let bol: boolean = true

  return function (...p): void {
    if (!bol) return

    bol = false

    setTimeout((_: void) => {
      fun.apply(this, p)
      bol = true
    }, delay || 1000)
  }
}