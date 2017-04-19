function initLogoAnimation () {
  console.info('initLogoAnimation')
  let i = 1
  let d = 0.01
  let l = 10
  function draw () {
    i += d
    const sin = Math.sin(i)
    const sinn = (sin + 1) / 2
    if (i > l || i < 1) { d *= -1; l = (Math.random() * 10) + 10 }
    const mm = document.getElementById('maomao-pup')
    mm.closePixelate([
                    { resolution: Math.round(2 + i + (Math.round(l / 50))) },
                     { shape: 'square', resolution: Math.round(sinn * i / 2 * l), offset: l / 10, alpha: 0.55 },
                     { shape: 'circle', resolution: Math.round(sin * i * 2 * l), offset: l / 20, size: 20, alpha: 0.5 }
    ])
    mm.style.visibility = 'visible'
    requestAnimationFrame(draw)
    return true
  }
  requestAnimationFrame(draw)
}

$(function () {
  window.addEventListener('load', initLogoAnimation, false)
})
