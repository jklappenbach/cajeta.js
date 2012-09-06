<h1>Welcome to CajetaJS!</h1> 
<h4>Status: Prototype 0.0.1</h4>

CajetaJS was created with the desire to bring the power of Apache Wicket's templating strategy to the field of JavaScript application frameworks.  In addition to powerful templating, my goal was to build a framework that focused on sound, time-tested software development principles:  modular structure, object-oriented design, micro-architectures, and scalability.

<h2>Why Wicket?</h2>

Wicket was really the first Java framework for web applications that felt right for me.  In many ways, it was exactly like developing on traditional native application SDKs.  One creates the application object, then some components which are added as children, and the entire application is managed as a hierarchy.  In addition, the Wicket founders understood the workflow in many top development houses.  Broken into teams, a UX side focuses on graphic design, information architecture, and the user experience; while a development side attempts to convert these deliverables into scalable, bulletproof implementation.  In the ideal workflow, both teams share the declarative artifacts over the span of the development lifecycle.

The problem is that when UX teams deliver HTML, the developers usually take these files, pepper them with macros, template declarations, and other non-HTML conforming code.  The result is that the UX deliverables are usually dead on arrival.  Wicket takes an approach to dynamic content that avoids this, by using special attributes in normal HTML tags that indicate targets for dynamic content, but are ignored by editors and browsers.  Furthermore, Wicket favored AJAX based element replacement over page reloads, enabling dramatically more responsive applications with half the effort of competing SDKs.

Obviously, with a JavaScript framework operating on the browser or native sandbox, CajetaJS is going to be a bit different than Wicket.  But for those of you familiar, I hope you feel that I've managed to preserve the original semantics.

<h2>Modularity</h2>

JavaScript has no "import" or "include" statement.  With AMD, JavaScript modules gain the ability to include external scripts.  Furthermore, AMD executes scripts in anonymous functions, preventing global namespace pollution.  With this strategy, large software projects can be broken down into smaller, manageable modules.  This, in turn, allows larger teams to work without trivial conflicts.  AMD also promotes code reuse through class definitions.  But wait, we really don't want browsers making dozens of calls for every page load to various modules, do we?  

No.  

That's where r.js comes in.  As part of the build chain for Cajeta, r.js optimizes the script calls and performs minimization.  Part of the roadmap for Cajeta will be to produce a similar function for HTML templates, reducing the many files involved into perhaps even one file for production.

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

<blockquote>We define micro-architecture as a set of patterns used together to realize parts of a system or subsystem. We view a micro-architecture as a building block for piecing together well-known, cohesive portions of an overall architecture. A micro-architecture is used to solve a coarser-grained, higher-level problem that cannot be solved by a single pattern. Thus, a micro-architecture represents a higher level of abstraction than the individual patterns.</blockquote>

In developing Cajeta, the concept of a micro-architecture has been the litmus test for design.  Over my years of software development, I've seen important benefits from the approach.  Code use is maximized, as is maintainability.  But the best? That's when you've reach a critical mass, and the code is largely written by drawing on existing primitives, instead of trying to figure out how to refactor larger constructs.

<h2>Scalability</h2>

The benefits of an approach like Cajeta are much more than what I've outlined so far.  One of the strategic accomplishments of the current generation of JavaScript frameworks is the move of the controller from the server to the client.  Applications can now be easily designed with all navigation and view logic completely resident in the browser.  This can potentially reduce interaction with back-end services to just authentication, and REST access to datasources.  For the end-user, the result is a much more responsive and enjoyable experience.  For the server developer, the ability to focus on REST based APIs results in reduced complexity and time-to-market.  For business stakeholders, the benefits are realized in cost savings with reduced loads and development overhead.

<h2>Getting Started</h2>

The project is currently in a prototype phase, but is functional.  Until the build process is worked out, r.js (or any formal chain) will be left to the developer. A test project has been placed under cajeta.js/test/webapp.  Since the project uses the text.js plugin for RequireJS, requests are only supported through a webserver.  Just configure your webserver's document root for cajeta.js/test/webapp, start the server, and point your browser to <a href="http://localhost/index.html">http://localhost/index.html</a>.

A demo REST server is planned, both to test a currently undeveloped client request layer, as well as demonstrate a POC REST server based on Apache Avro.

For more information on the project, please see the Wiki and the Issues sections of this site.  Also, feel free to join groups for <a href="https://groups.google.com/forum/?fromgroups#!forum/cajeta-users">CajetaJS Users</a> and <a href="https://groups.google.com/forum/?fromgroups#!forum/cajeta-developers">CajetaJS Developers</a> depending on your interest.

