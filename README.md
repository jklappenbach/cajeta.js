<h1>Welcome to CajetaJS!</h1> 

CajetaJS was created with the desire to bring the power of Apache Wicket's templating strategy to the field of JavaScript application frameworks.  In addition to powerful templating, my goal was to build a framework that focused on sound, time-tested software development principles:  modular structure, object-oriented design, micro-architectures, and scalability.

<h2>Why Wicket?</h2>

Wicket was really the first Java framework for web applications that felt right for me.  In many ways, it was exactly like developing on many native application SDKs.  One creates the application object, then some components which are added as children, and the entire application is managed as a hierarchy.  In addition, the Wicket founders understood the workflow in many top development houses.  Broken into teams, a UX side focuses on graphic arts, information architecture, and the user experience; while a development side attempts to convert these deliverables into scalable, bulletproof implementation.  In the ideal workflow, both teams share the declarative artifacts of web applications: HTML.

The problem is that when UX teams deliver HTML, the developers usually take these files, pepper them with macros, template declarations, and other non-HTML conforming code.  The result is that the UX deliverables are usually dead on arrival.  Wicket takes an approach to dynamic content that avoids this, by using special attributes in normal HTML tags that indicate targets for dynamic content, but are ignored by editors and browsers.  Furthermore, Wicket favored AJAX based element replacement over page reloads, enabling dramatically more responsive applications with half the effort of competing SDKs.

Obviously, with a JavaScript framework operating on the browser or native sandbox, the CajetaJS API is going to be a bit different than Wicket's.  But for those of you familiar, I hope you feel that I've managed to preserve the original semantics.

<h2>Modularity</h2>

JavaScript has no "import" or "include" statement.  With AMD, JavaScript modules gain the ability to include external scripts.  Furthermore, AMD executes scripts in anonymous functions, preventing global namespace pollution.  With this strategy, large software projects can be broken down into smaller, manageable modules.  This, in turn, allows larger teams to work without trivial conflicts.  I'll go so far as to predict that, unless the custodians of the JavaScript specs relent and allow an "include" capability in the language, AMD will sweep the field.  But wait, we really don't want browsers making tens of calls for every page load to various modules, do we?  

No.  

That's where r.js comes in.  As part of the build chain for Cajeta, it optimizes the script calls and performs minimization.  Part of the roadmap for Cajeta will be to produce a similar function for HTML templates, reducing the many files involved into perhaps even one file for production.

<h2>Object Oriented Design</h2>

JavaScript has its fair share of detractors, and honestly, they have every right to point fingers.  Case in point: the prototype system has some woefully ugly edge cases for inheritance.  With Cajeta, many existing inheritance strategies were evaluated and lessons learned were used in the resulting design.  Given the number of attempts at solving prototype's deficiencies over the years, I wouldn't be surprised if Cajeta's approach hasn't been done before.  Regardless, with it, developers can enjoy:
<ul>
<li>The freedom to create arbitrary layers of inheritance, utilizing function overrides and polymorphism.</li>
<li>Not having to worry about constructors firing during the definition phase.</li>
<li>Avoiding class property mirroring between child and parent classes.</li>
<li>An extension strategy that is easy to implement and maintain.</li>
</ul>
<h2>Micro-Architecture</h2>

The basic idea behind MA is to evaluate the design of a software system from the perspective of the interaction of small atomic units of functionality or patterns, and to implement the system using these atoms.  From the book Core J2EE Patterns:

We define micro-architecture as a set of patterns used together to realize parts of a system or subsystem. We view a micro-architecture as a building block for piecing together well-known, cohesive portions of an overall architecture. A micro-architecture is used to solve a coarser-grained, higher-level problem that cannot be solved by a single pattern. Thus, a micro-architecture represents a higher level of abstraction than the individual patterns.

In developing Cajeta, the concept of a micro-architecture has been the litmus test for design.  Over my years of software development, I've seen important benefits from the approach.  Code use is maximized, as is maintainability.  But the best? That's when you've reach a critical mass, and the code just seems to write itself.

<h2>Scalability</h2>

The benefits of an approach like Cajeta are much more than what I've outlined so far.  One of the strategic accomplishments of the current generation of JavaScript frameworks is the move of the controller from the server to the client.  Applications can now be easily designed with all navigation and view logic completely resident in the browser.  This can potentially reduce interaction with back-end services to just authentication, and REST access to datasources.  For the end-user, the result is a much more responsive and enjoyable experience.  For the server developer, the ability to focus on REST based APIs results in reduced complexity and time-to-market.  For business stakeholders, the benefits are realized in cost savings with reduced loads and development overhead.

I've really enjoyed putting together this project, and I sincerely hope you enjoy it as well.
