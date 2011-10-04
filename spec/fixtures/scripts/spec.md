A terminal scripting language with emphasis on terseness and readability. The scripting language compiles into TML code, which can be distributed to terminals via Incendo Online.

Here are some of the features that the scripting language adds, beyond vastly reducing the amount of typing necessary for TML development:

## Type Inferencing

The type of any given variable is inferred by its context. For instance, in the following example, the variable +a+ will be set to an +integer+ type:

    a = 1
    
This simple example compiles into the following TML document:

    <tml xmlns="http://www.ingenico.co.uk/tml" cache="deny">
      <head>
        <defaults cancel="emb://embedded.tml" />
      </head>
      <vardcl name="a" type="integer" />
      <screen id="__main__">
        <setvar name="a" lo="1" />
      </screen>
    </tml>

## Defining Methods

Methods are defined in one of two ways: with and without method arguments. A method without arguments can simply be the name of the method, followed by a colon, as the following example demonstrates:

    say_hello:
      return "Hello, World!"
      
The above code creates a +say_hello+ method that, when called, will display the classic "Hello, World!" string on the terminal.

If arguments are required by the method, they are listed in parentheses like so:

    say_hello_to(name):
      return "Hello, " + name

## Calling Methods

Method calls are denoted simply by the name of the method, followed by parentheses, like so:

    say_hello()
    say_hello_to("Colin")
    
If one or more arguments are supplied to the method, the parentheses can be omitted. In this case, the compiler will add them implicitly and the result will be the same:

    say_hello_to "Colin"
    
Note that if there are no arguments, the parentheses must be supplied in order to indicate that the reference is a method call (as opposed to a local variable name, for instance).

## Local Variables

In TML, all variables are normally global in scope to a particular TML document. The scripting language alters the names of local variables so that any given method essentially has scope local to the method itself. This allows methods to use variable names that would otherwise conflict with one another, as is the case in the following example:

    a_string: a = "hello"   # => local variable 'a' is a string
    a_integer: a = 1        # => local variable 'a' is an integer
    
If you wish to give a particular variable global scope, simply initialize it with some value at the top level of the script:

    a = 0
    a_integer: a = 1

