// Read-only page capture for the legacy ODMS discovery. Reads the DOM only; never clicks, submits or navigates.
// Usage in the page console: odmsCapture('summary' | 'fields' | 'modals' | 'links' | 'table', offset)
(() => {
  const tok = (s) => s.replace(/[A-Za-z0-9+/=_%-]{24,}/g, '[tok]').replace(/\b\d{10}\b/g, '[phone]')
  const txt = (e) => (e?.innerText || e?.textContent || '').replace(/\s+/g, ' ').trim()
  const page = () => document.querySelector('.layout-page') || document.body
  const outside = (e) => e.closest('#layout-menu, aside, .layout-menu, nav.layout-navbar, .navbar')
  const skipModal = /autoOpenModal|documentPreviewModal|detailsModal|reminderPopupModal/
  const labelOf = (e) => {
    const l = e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)
    if (l) return txt(l)
    const g = e.closest('.form-group, .mb-3, .mb-2, .mb-4, [class*=col-], .input-group, td, th')
    return txt(g?.querySelector('label')) || e.placeholder || e.getAttribute('aria-label') || e.name || '?'
  }
  const field = (e) => {
    const kind = e.tagName === 'SELECT' ? 'select' : e.tagName === 'TEXTAREA' ? 'textarea' : e.type
    let s = `${labelOf(e).slice(0, 40)} <${kind}${e.required ? ' req' : ''}${e.readOnly ? ' ro' : ''}${e.disabled ? ' dis' : ''}${e.multiple ? ' multi' : ''}${e.maxLength > 0 ? ' max=' + e.maxLength : ''}${e.accept ? ' accept=' + e.accept : ''}${e.pattern ? ' pattern' : ''}>`
    if (e.tagName === 'SELECT') {
      const o = [...e.options].map((x) => x.text.trim()).filter(Boolean)
      s += `[${o.slice(0, 25).join('|')}${o.length > 25 ? `|+${o.length - 25}` : ''}]`
    }
    return s
  }
  const fieldsIn = (root) =>
    [...root.querySelectorAll('input, select, textarea')]
      .filter((e) => e.type !== 'hidden' && !outside(e) && !e.closest('.dataTables_length, .dataTables_filter') && !/Search menu/.test(e.placeholder || ''))
      .map(field)

  window.odmsCapture = (part = 'summary', offset = 0, size = 1400) => {
    const root = page()
    let out = ''
    if (part === 'summary') {
      const heads = [...new Set([...root.querySelectorAll('h1,h2,h3,h4,h5,h6,.card-title,.breadcrumb')].filter((e) => !outside(e) && !e.closest('.modal')).map(txt).filter(Boolean))]
      const btns = [...new Set([...root.querySelectorAll('a.btn, button, input[type=submit], input[type=button]')].filter((e) => !outside(e) && !e.closest('.modal')).map((b) => txt(b) || b.value || b.title || b.getAttribute('aria-label')).filter((t) => t && t.length < 40))]
      const tables = [...root.querySelectorAll('table')].filter((t) => !t.closest('.modal')).map((t) => {
        const heads = [...t.querySelectorAll('thead th')].map(txt).filter(Boolean)
        const r = t.querySelector('tbody tr')
        const acts = r ? [...(r.lastElementChild?.querySelectorAll('a, button') || [])].map((a) => txt(a) || a.title || (a.querySelector('i')?.className || '').split(' ').pop()) : []
        return `TABLE#${t.id || '-'} rows=${t.querySelectorAll('tbody tr').length} cols=[${heads.join(' | ')}] rowActions=[${acts.join(',')}]`
      })
      const menus = [...root.querySelectorAll('.dropdown-menu')].filter((d) => !outside(d)).map((d) => [...d.querySelectorAll('a, button')].map(txt).filter(Boolean).join('/')).filter(Boolean)
      out = `URL ${location.pathname} | TITLE ${document.title}\nHEAD ${heads.join(' / ')}\nBTN ${btns.join(' / ')}\n${tables.join('\n')}\nMENUS ${[...new Set(menus)].join(' || ')}`
    } else if (part === 'text') {
      out = root.innerText.replace(/\s*\n\s*/g, ' | ').replace(/^.*?Ctrl\+K/, '')
    } else if (part === 'fields') {
      out = fieldsIn(root).join(' ; ')
    } else if (part === 'modals') {
      out = [...document.querySelectorAll('.modal, .offcanvas')].filter((m) => !skipModal.test(m.id)).map((m) => `MODAL#${m.id} "${txt(m.querySelector('.modal-title, .offcanvas-title'))}" FIELDS: ${fieldsIn(m).join(' ; ')} BTN: ${[...m.querySelectorAll('button, a.btn')].map(txt).filter(Boolean).join('/')}`).join('\n')
    } else if (part === 'links') {
      out = [...new Set([...root.querySelectorAll('a[href]')].filter((a) => !outside(a)).map((a) => `${txt(a).slice(0, 25) || a.title || '(icon)'}=${a.pathname.replace(/\/\d+(?=\/|$)/g, '/{id}')}`).filter((s) => /=\/[\w\-/{}%.]+$/.test(s) && !/notification|profile|password|logout/.test(s)))].join(' ; ')
    } else if (part === 'menu') {
      const items = [...document.querySelectorAll('#layout-menu .menu-item, aside .menu-item')].map((li) => {
        const depth = (() => { let d = 0, p = li.parentElement; while (p && !p.matches('#layout-menu, aside')) { if (p.matches('.menu-sub')) d++; p = p.parentElement } return d })()
        const a = li.querySelector(':scope > a')
        return `${'  '.repeat(depth)}${txt(a)}${a && a.pathname && a.pathname !== '/' && !a.href.startsWith('javascript') ? ' → ' + a.pathname : ''}`
      })
      out = items.join('\n')
    }
    out = tok(out)
    return `[${offset}/${out.length}] ` + out.slice(offset, offset + size)
  }
  return 'odmsCapture ready'
})()
