define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/homePage.html',
    'about.div',
    'api.div',
    'blog.div',
    'download.div',
    'examples.div',
    'guide.div',
    'community.div'
], function($, infusion, homePageText, about, api, blog, download, examples, guide, community) {
    
    // Create an alias for shortening namespace.
    var html5 = infusion.view.html5;

    var homePage = new infusion.view.Page({ cid: infusion.homePage, template: homePageText });

    var tabs = new html5.TabList({ cid: 'tabs', contentId: 'content' });
    tabs.addChild({ title: 'About', component: about });
    tabs.addChild({ title: 'Guide', component: guide });
    tabs.addChild({ title: 'API', component: api });
    tabs.addChild({ title: 'Examples', component: examples });
    tabs.addChild({ title: 'Community', component: community });
    tabs.addChild({ title: 'Download', component: download });
    homePage.addChild(tabs);

    return homePage;
});
