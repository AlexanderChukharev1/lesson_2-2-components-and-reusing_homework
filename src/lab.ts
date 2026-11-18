import type { Booking } from './models/booking'

// Готовая диагностика. Shadow DOM читается только здесь, не в бизнес-логике.
type Sample = HTMLElement & { booking: Booking }
export function mountLab(target: HTMLElement) {
  target.innerHTML = `
    <fieldset class="lab-group"><legend>Данные и жизненный цикл</legend><div id="core-tools" class="toolbar"></div></fieldset>
    <div id="sample"></div>
    <output id="lab-output" aria-live="polite">Начните с «Создать образец». До А1 компонент не зарегистрирован.</output>
    <details><summary>Проверки дополнительной части</summary>
      <fieldset class="lab-group"><legend>Д1 и Д3: режим, тема, обновление</legend><div id="bonus-tools" class="toolbar"></div></fieldset>
      <p class="lab-help">Операции применяются к образцу выше. Перемена внешнего CSS должна затронуть кнопки страницы, но не внутреннюю кнопку компонента.</p>
      <fieldset class="lab-group"><legend>Д2: две подписи одной заявки</legend><div id="slot-tools" class="toolbar"></div></fieldset>
      <div id="slot-samples"></div><p id="slot-output" class="lab-help"></p>
    </details>`
  const stage = target.querySelector<HTMLElement>('#sample')!
  const output = target.querySelector<HTMLOutputElement>('#lab-output')!
  const pair = target.querySelector<HTMLElement>('#slot-samples')!
  const slotOutput = target.querySelector<HTMLElement>('#slot-output')!
  let card: Sample | null = null
  let originalRoot: ShadowRoot | null = null
  let originalButton: Element | null = null
  let originalArticle: Element | null = null
  let assigned: Booking | null = null
  let snapshot = ''
  let received = 0
  let lastDetail = 'нет'
  let timer: ReturnType<typeof setTimeout> | undefined
  let pairCards: Sample[] = []
  const data = (): Booking => ({ id: 'sample', name: 'Иван', seats: 1, status: 'new', source: 'web' })
  const changed = (): Booking => ({ ...data(), name: 'Мария', seats: 3, status: 'confirmed' })
  const show = (text: string) => {
    const root = card?.shadowRoot
    const sameTree = originalRoot && root === originalRoot && root.querySelector('article') === originalArticle
    output.textContent = `${text} | Событий: ${received} | detail: ${lastDetail} | Подключён: ${card?.isConnected ? 'да' : 'нет'} | Дерево: ${!originalRoot ? 'ещё нет' : sameTree ? 'то же' : 'изменилось'} | Кнопка: ${!originalButton ? 'ещё нет' : root?.querySelector('button') === originalButton ? 'та же' : 'изменилась'} | Входной объект: ${!assigned ? 'не передан' : JSON.stringify(assigned) === snapshot ? 'не изменён' : 'изменён компонентом'}`
  }
  const give = (value: Booking) => { assigned = value; snapshot = JSON.stringify(value); card!.booking = value }
  const action = (group: string, id: string, title: string, fn: () => void, needsCard = true) => {
    const button = document.createElement('button')
    button.type = 'button'; button.id = id; button.textContent = title
    button.addEventListener('click', () => {
      if (needsCard && !card) { output.textContent = 'Сначала нажмите «Создать образец».'; return }
      fn()
    })
    target.querySelector(`#${group}`)!.append(button)
  }
  action('core-tools', 'create-sample', 'Создать образец', () => {
    if (!customElements.get('booking-card')) { output.textContent = 'booking-card ещё не зарегистрирован. Выполните А1.'; return }
    clearTimeout(timer); card?.remove(); received = 0; assigned = null; lastDetail = 'нет'
    card = document.createElement('booking-card') as Sample
    card.addEventListener('booking-status-request', (event) => {
      received += 1
      lastDetail = event instanceof CustomEvent ? JSON.stringify(event.detail) : 'нет detail'
      show('Получен запрос; стенд не применяет его к данным')
    })
    stage.replaceChildren(card)
    originalRoot = card.shadowRoot
    originalButton = originalRoot?.querySelector('button') ?? null
    originalArticle = originalRoot?.querySelector('article') ?? null
    show('Создан пустой экземпляр')
  }, false)
  action('core-tools', 'give-new', 'Иван: 1, new', () => { give(data()); show('Передана новая заявка') })
  action('core-tools', 'give-confirmed', 'Иван: 1, confirmed', () => { give({ ...data(), status: 'confirmed' }); show('Передана подтверждённая заявка') })
  action('core-tools', 'give-changed', 'Мария: 3, confirmed', () => { give(changed()); show('Тот же id, другой объект') })
  action('core-tools', 'detach', 'Отключить', () => { card!.remove(); show('Образец сохранён вне документа') })
  action('core-tools', 'detached-click', 'Клик по отключённой', () => {
    if (card!.isConnected) { show('Сначала нажмите «Отключить»'); return }
    card!.shadowRoot?.querySelector('button')?.click(); show('Вызван click вне документа')
  })
  action('core-tools', 'attach', 'Вернуть', () => { if (!card!.isConnected) stage.append(card!); show('Возвращён тот же экземпляр') })
  action('bonus-tools', 'toggle-compact', 'Переключить compact', () => { card!.toggleAttribute('compact'); show(`compact: ${card!.hasAttribute('compact') ? 'есть' : 'нет'}`) })
  action('bonus-tools', 'compact-false', 'compact="false"', () => { card!.setAttribute('compact', 'false'); show('compact присутствует со строкой false') })
  action('bonus-tools', 'toggle-theme', 'Переключить цвет', () => {
    const style = card!.style
    if (style.getPropertyValue('--booking-accent')) style.removeProperty('--booking-accent')
    else style.setProperty('--booking-accent', '#157f63')
    show('Переключена переменная на host: зелёный / запасной цвет')
  })
  const external = document.createElement('style')
  target.append(external)
  action('bonus-tools', 'external-css', 'Переключить внешний CSS', () => {
    external.textContent = external.textContent ? '' : 'body button { background: #b34264; }'
    show('Изменён внешний селектор body button')
  })
  action('bonus-tools', 'update-later', 'Обновить через 1 с', () => {
    const currentCard = card!
    currentCard.shadowRoot?.querySelector('button')?.focus()
    show('Фокус на внутренней кнопке. Через секунду передадим данные Марии')
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (card !== currentCard) return
      const before = currentCard.shadowRoot?.activeElement
      give(changed())
      const stayed = Boolean(before) && currentCard.shadowRoot?.activeElement === before
      show(`Данные обновлены. Фокус сохранился: ${stayed ? 'да' : 'нет'}`)
    }, 1000)
  })
  action('slot-tools', 'create-pair', 'Создать две подписи', () => {
    if (!customElements.get('booking-card')) { slotOutput.textContent = 'Сначала выполните А1.'; return }
    pairCards = ['Общий список', 'Подтверждённые'].map(text => {
      const sample = document.createElement('booking-card') as Sample
      sample.booking = changed()
      const note = document.createElement('span'); note.slot = 'note'; note.textContent = text
      sample.append(note)
      return sample
    })
    pair.replaceChildren(...pairCards)
    slotOutput.textContent = 'Одна заявка, два экземпляра. Подписи переданы снаружи через отдельные узлы.'
  }, false)
  action('slot-tools', 'remove-note', 'Убрать первую подпись', () => {
    if (!pairCards.length) { slotOutput.textContent = 'Сначала создайте две подписи.'; return }
    pairCards[0]!.querySelector('[slot="note"]')?.remove()
    slotOutput.textContent = 'Первый экземпляр должен показать «Комментарий не задан».'
  }, false)
  action('slot-tools', 'refresh-pair', 'Обновить и вернуть пару', () => {
    if (!pairCards.length) { slotOutput.textContent = 'Сначала создайте две подписи.'; return }
    for (const sample of pairCards) { sample.remove(); sample.booking = data(); sample.setAttribute('compact', ''); pair.append(sample) }
    slotOutput.textContent = 'Передан Иван: 1, new; включён compact. Подписи или запасной текст должны сохраниться.'
  }, false)
}
