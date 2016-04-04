A simple lisp interpreter in JavaScript.

Run using node
  
    $ node build/lisp.js

Type `quit` to exit

    λ quit

### Suppported forms

**if**

    λ (if (> pi 5) "true" "false")
    "false"

**let**

    λ (let ((x 10) (y 20)) (+ x y))
    30

**lambda**

    λ ((lambda (x y) (+ x y)) 10 20)
    30

**define**

    λ (define pi 3. 14)
    3.14

    λ (define square (lambda (x) (* x x)))
    square
    λ (square 10)
    100

**set!**

    λ (define x 10)
    10
    λ (set! x 20)
    20
    λ x
    20

### Credits

I wrote this to understand how an interpreter works. The code borrows heavily from Peter Norvig's [Python implementation](http://norvig.com/lispy.html) and Mary Rose Cook's [JavaScript version](https://github.com/maryrosecook/littlelisp).