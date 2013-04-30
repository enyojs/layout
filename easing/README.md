# EASING DOCUMENTATION #

1. [What Is Easing?](#1)
2. [Easing Methods](#2)

<a name="1"></a>
## 1. WHAT IS EASING? ##

This library extends enyo.easing, by including additional, more complex interpolation methods.

To add **[Easing](https://github.com/enyojs/layout/easing)** to an application, simply include the
`Easing` package in your `package.js` file and add an enyo.Animator control with 
a valid easingFunction:

    {
        kind: 'enyo.Animator',
        onStep: 'animatorStep',
        onEnd: 'animatorComplete',
        easingFunction: enyo.easing.easeOutBack   
    }

<a name="2"></a>
## 2. EASING METHODS ##

This library adds thirty additional easing methods to the five that are included in enyo.easing:

* **easeInQuad**
* **easeOutQuad**
* **easeInOutQuad**
* **easeInCubic**
* **easeOutCubic**
* **easeInOutCubic**
* **easeInQuart**
* **easeOutQuart**
* **easeInOutQuart**
* **easeInQuint**
* **easeOutQuint**
* **easeInOutQuint**
* **easeInSine**
* **easeOutSine**
* **easeInOutSine**
* **easeInExpo**
* **easeOutExpo**
* **easeInOutExpo**
* **easeInCirc**
* **easeOutCirc**
* **easeInOutCirc**
* **easeInElastic**
* **easeOutElastic**
* **easeInOutElastic**
* **easeInBack**
* **easeOutBack**
* **easeInOutBack**
* **easeInBounce**
* **easeOutBounce**
* **easeInOutBounce**
