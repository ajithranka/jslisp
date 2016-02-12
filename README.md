A simple lisp interpreter in JavaScript.

    $ node lisp.js
    jslisp> (define r 10)
    10
    jslisp> (* r r)
    100
    jslisp> quit

I wrote this to understand how an interpreter works. The code borrows heavily from Peter Norvig's [Python implementation](http://norvig.com/lispy.html) and Mary Rose Cook's [JavaScript version](https://github.com/maryrosecook/littlelisp).