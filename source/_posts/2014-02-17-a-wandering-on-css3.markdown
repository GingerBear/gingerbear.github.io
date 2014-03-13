---
layout: post
title: "A wandering on CSS3"
date: 2014-02-17 13:19
comments: true
categories: [css, tech, css3, learn]
---

CSS3 sounds like new tech, but it has been around for years with a increasing adoption on main browsers. I have been using CSS for years, but mostly using those main features, or triditional CSS2 features like position, styling, flaoting, etc, and a little bit decorating CSS3 features like border-radius, and box-shadow. CSS is not difficult, and when I think I have master the basic, I stop exploring those new features and believe that they are still on the way on browser compatbility.

Recently front end technique is envolving so fast that experimental CSS3 things now become practical. Also due to the face that I have preparing for the front end job interview, I am going to make a wandering on these new features of CSS3.

### Decoration
#### box-shadow, border-radius, opacity
Most common used CSS3 features, and they are very well supported by modern browsers. `box-shadow` make shadow very easy in web pages. There are several paramaters to precisely control shadows, color, offset, blur, speard and inner/outter. It is often use in popup, dropdown. It is already been vendor-prefix freed on my just look on google plus sharing popup. `border-radius` is a interesting one. It used to be a lot of round coner hack out there. Like background image replacing, pixel mimicing. And I used to get excieted by there hacks. But now, they all gone by the missive adoption of `border-radius`. It sample to use. We can control four corner by four radius parameters. `opacity` is intiative that it control the trnasperency of a element with a percentage value, which is very useful in styling, and has no side effect.

### Flexbox and layout

I heard `flexbox` very early, with the phrase that it is the most wanted feature in CSS3. From my recent learning, it is used for layout, which is one of the most discuessed topic in css layout. There used to be 3 main layout methods on the market. Table is the note ancient. It put elements into a big table, arrange them by tr, td. It is sample but it not flexible. If we want complex layout, the markup will be massed. Second is using float. It is massively adopted. Elements is arranged horizontally by fix the width and float them. The limitation is that Their width are fixed, or at least one of them is fixed. Besides, it need some tricky way to clear these float. Third is using absolut position to control layout. The advantage is that they are very easy to control. It is more like drawing, rather than arranging. The drawback is that the main flow is breaked. The normal element flow is breaked, which make the layout less extendable. 

Here comes the flexbox, it natually arrange the element horizontally in the flex contianer, or vertically. In the flex box container, it is very configrable to layout elements, not matter by horizontal, vertical, alignment, centering, evenly seperated, growing differently, or by custom order. It is like a new box flowing model that completely independent on normal box flow. So the flow item will not be affected by `float`, `clean` and `vertical-align`. 

Another things need to be mentioned about layout is Grid system. Grid system is not a native css feature, but a third-party position framework that arrange elements on the page, by specifing a pre-defined class. It is suggested a optimal solution for large scaled page layout. From my personal usage of Bootstrap grid system, I feel it less flexible, but more consistent cross multi-pages. Also by grid system it is easy to implement an integrated responsive solutions. 

### Animation
#### transition, animation

Animation is good feature to make some easy animation. It is fairly sample to use and, more importantly, rendered by GPU, which means more smooth animation. There are two type of animation, transition and animation. Transition is simpler. It is a property of one element that indication some change of property should be gradually made. For example, element's width is changed by hovering. The width will change gradually. Change can only be applied to a set of properties like height/width, opacity, color, padding, margin, border, left/top. Properties that could be changed gradually. These change may triggered by a lot of event, hover, click, media-query, and javascript add class. Some parameter can also be added, like duration, delay, ease/linear, infinite. 

Animation is little different. In order to make a animation. We first need to define an keyframe, which is defined by a bunch of properties in a period property. from `from` to `to`, or from `0%` to `50%` to `100%`. With keyframe defined, it can be assign to element by animation property, with a bunch of parameters like delay, duration, ease/linear, alternate, infinite to indicate that animation.

Another property is necessary to mention here, which is transform. I used to confuse it with transition. May because they looks like or they are always used together. So transform is just about four things: translate, scale, rotate, skew, and something matrix or 3d stuff. It can change an element's position, scale it, rotate it, and skew it. 

TranslateZ(0) could be use as a hack to improve page render performance. It force an element into a new layer, to avoid unnecessary re-paint.

### Media Query

Media Query is use to deal with different style for differnt devices or different screen size. With a media query, we can define a specific style for screen or print with max/min with of screen, orientation of device, use logic operator like and/or. When critiria meet, browser will load styles in it. This feature make reponsive design happened.

### Pseudo things

Pseudo things include Pseudo class and Pseudo elements. Pseudo classes refers to most used hover, active, checked, focus. Some newly adoped CSS3 seletor like nth-child(), first-child, root. Pseudo element is more used, which is :before and :after. They literally insert a same element before/after the target element. We could set style on them to add no-sematic content-based style, like quotes, icon. They can also be used to clearfix float, by a after pseudo-element. Pseedo element must have a content property. Its content can be fill dymanically with markup attributes by `attr()`. There are a lot of interesting pseudo element usage in [this page](http://css-tricks.com/pseudo-element-roundup/).

- END -


