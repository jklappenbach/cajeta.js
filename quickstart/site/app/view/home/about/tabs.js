define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/about/tabs.html'
], function($, infusion, template) {
    
    // Create an alias for shortening namespace.
    var html5 = infusion.view.html5;
    var tabs = new html5.TabList({ cid: 'tabs', contentId: 'content' });
    return tabs;
});
