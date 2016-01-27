# Survarium.pro | Players widget

Виджет предназначен для поиска и отображения статистики игроков с сайта http://survarium.pro

## Подключение | iframe
[Пример](https://survarium.pro/widgets/players-iframe.html)  
Достаточно указать адрес фрейма. По желанию можно добавить data-аттрибуты `data-search`, `data-player`, `data-bypid`.

```html
<iframe src="https://survarium.pro/widgets/players.html"></iframe>

<!-- OR -->

<iframe src="https://survarium.pro/widgets/players.html" allowfullscreen width="100%" height="400px" frameborder="0" data-search="ĘŚĆ"></iframe>

<!-- OR -->

<iframe src="https://survarium.pro/widgets/players.html" allowfullscreen width="100%" height="400px" frameborder="0" data-player="15238791817735151910" data-bypid="true"></iframe>
```

## Подключение | javascript
[Пример](https://survarium.pro/widgets/players-script.html)  

### CORS
Для добавления Вашего хоста в список CORS, создавайте issue на github с темой "CORS Request" и указанием хоста в описании, например, `https://example.com`. Если Вас нет на github, то создавайте запрос в теме https://vk.com/topic-110270873_33546264 по той же схеме.

### Асинхронный режим
* Подключить скрипт с аргументом `async` 
```html
<script src="https://survarium.pro/widgets/players.js" async></script>
```
* Объявить функцию, вызываемую после загрузки кода виджета 
```js
<script>
window['SurvariumPlayersReady'] = function (Widget) {
  new Widget({ target: document.getElementById('main') });
  
  // OR
  
  new SurvariumPlayers({ target: '#main' })
}
</script>
```

### Синхронный режим
* Подключить скрипт 
```html
<script src="https://survarium.pro/widgets/players.js" async></script>
```
* __После__ подключения скрипта, вызвать конструктор `SurvariumPlayers` 
```js
new SurvariumPlayers({ target: '#main' })
```

### API
Конструктор `SurvariumPlayers` ожидает единственным агрументом хэш параметров
```js
 * Widget constructor
 * @param {Object}   params
 * @param {String|*} params.target              DOM элемент или селектор для вставки виджета
 * @param {String}   [params.language=russian]  Язык (russian, english)
 * @param {Function} [params.handleError]       Кастомных обработчик ошибок
 * @param {String}   [params.search]            Фраза в поиске
 * @param {String}   [params.player]            Игрок для отображения (поиск скрыт)
 * @param {Boolean}  [params.byPID]             Параметр player является PID
```
