define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/homePage.html',
    'about.tabs',
    'api.tabs',
    'blog.tabs',
    'download.tabs',
    'examples.tabs',
    'guide.tabs',
    'community.tabs'
], function($, infusion, homePageText, about, api, blog, download, examples, guide, community) {
    
    // Create an alias for shortening namespace.
    var html5 = infusion.view.html5;

    var homePage = new infusion.view.Page({ cid: infusion.homePage });
    homePage.setTemplate('homePage', homePageText);

//    var tabs = new html5.TabList({ cid: 'tabs', contentId: 'content' });
//    tabs.addChild({ title: 'About', component: about });
//    tabs.addChild({ title: 'Guide', component: guide });
//    tabs.addChild({ title: 'API', component: api });
//    tabs.addChild({ title: 'Examples', component: examples });
//    tabs.addChild({ title: 'Community', component: community });
//    tabs.addChild({ title: 'Download', component: download });
//    homePage.addChild(tabs);

    return homePage;
});
