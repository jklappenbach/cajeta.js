define({
    abbrWeekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thurdsday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December'],
    about: 'About',
    overview: 'Overview',
    overviewDesc: '<h1>Why Infusion?</h1>' +
        '<p>After 25 years of application development, my experience has shown me the value of sound architectural principles, ' +
        'concepts such as:</p><br/><ul>' +
        '<li>Modular Implementation</li>' +
        '<li>Object Oriented Design</li>' +
        '<li>Dependency Injection</li>' +
        '<li>Separation of Concerns</li>' +
        '<li>Incorporation of Patterns</li>' +
        '<li>Micro-Controller Architecture</li></ul><br/>' +
        '<p>A few years ago, I started to evaluate client-side JavaScript frameworks.  While many offer novel innovation, they all failed, in one way or ' +
        'another, to meet the experience driven requirements that I’ve assembled over my career.',
    separationOfConcerns: 'Separation of Concerns',
    separationOfConcernsDesc: '<p>Separation of concerns is important.  After dealing with server-side frameworks like Struts, JFaces, Wicket, and ' +
        'Tapestry for decades, it became clear that the frameworks that featured SoC and strong component models (Tapestry and Wicket) offered easier ' +
        'debugging, fewer defects, and much lower cost of maintenance.  In fact, much of what I have loved about Wicket has been incorporated in Infusion.</p>' +
        '<p>HTML is a declarative language, aptly suited for declaring layout and content, but horrible for logic.  Worse yet, embedding business logic' +
        'in markup leads to fragmentation of code.  And as a nasty side-effect, it can render some editors useless for debugging.  Using a technology for ' +
        'the manner in which it was originally intended is just best practice.</p>',
    componentArchitecture: 'Component Architecture',
    componentArchitectureDesc: 'Another key concept, at least for application design, is that of a Component Architecture.  Based on Object Oriented Design, ' +
        'this is a software pattern that enhances reusability by breaking down interfaces into distinct components, and embedding relevant application ' +
        'logic within each component.  When a component is customized or implemented, this work can be isolated into a single module that can be easily ' +
        'distributed to other interfaces within the application, or even to other applications.  Compare this with many of the current popular frameworks, ' +
        'where controllers are dedicated to an entire view, and the benefit of MCA should be obvious.'
});