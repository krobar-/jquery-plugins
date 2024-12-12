# Javascript/jQuery Samples

This repository showcases a collection of JavaScript/jQuery plugins. Each plugin is lightweight, customizable, and demonstrates practical use cases for modern web interfaces.

## Table of Contents

- [EasyAnimation Plugin](#easyanimation-plugin)
- [Trakground Plugin](#trakground-plugin)
- [Tabby Plugin](#tabby-plugin)

---

## EasyAnimation Plugin

### Overview
The **EasyAnimation Plugin** adds dynamic animations to web elements, including counting, text scrambling, and fade effects. It’s perfect for creating engaging UI features with minimal effort.

### Features
- Supports animations such as:
  - **Count**: Animates numbers incrementally.
  - **Scramble**: Randomly replaces text characters until completion.
  - **Fade**: Smooth fade-in effects.
- Highly customizable with options for easing, delay, and duration.
- Triggers animations based on element visibility.

### Usage
Include the plugin in your project and apply it to any element using the `data-animate` attribute or via jQuery initialization.

```javascript
$(document).ready(function() {
    $('*[data-animate]').easyanimate({
        animation: 'count',
        start: 0,
        finish: 1000,
        duration: 2000
    });
});
```

---

## Trakground Plugin

### Overview
The **Trakground Plugin** enables dynamic video backgrounds with optional parallax scrolling effects. It’s ideal for creating visually engaging hero sections or full-page backgrounds.

### Features
- Supports background videos with image fallback for non-compatible browsers.
- Parallax scrolling effects for added depth.
- Video playback control based on element visibility or user interaction.

### Usage
Include the plugin and initialize it with configuration options like video source, parallax effects, and more.

```javascript
$('#background-element').trakground({
    mp4Src: 'path/to/video.mp4',
    imgSrc: 'path/to/fallback.jpg',
    parallax: true,
    pauseVideoOnViewLoss: true
});
```

---

## Tabby Plugin

### Overview
The **Tabby Plugin** provides an easy-to-use solution for creating tabbed content. It automatically generates tabs from specified containers, simplifying the organization of content-heavy pages.

### Features
- Dynamically generates tabs with labels from `data-tabby-label` attributes.
- Fully customizable styles and animations for transitions.
- Lightweight and easy to integrate.

### Usage
Add the `data-tabby` attribute to a container with child elements, then include the plugin to enable the tabbed interface.

```html
<div class="tab-container" data-tabby>
    <div data-tabby-label="Tab 1">Content for Tab 1</div>
    <div data-tabby-label="Tab 2">Content for Tab 2</div>
</div>
```

Initialize the plugin:

```javascript
$('.tab-container').tabby({
    firstPane: 1,
    effect: 'fade'
});
```

See the source code for more options and examples.