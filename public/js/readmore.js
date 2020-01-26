$.expander.defaults.slicePoint = 120;

$(document).ready(function() {
  // simple example, using all default options unless overridden globally
  // *** OR ***

  // override default options (also overrides global overrides)
  $('div.expandable p').expander({
    slicePoint:       300,  // default is 100
    expandPrefix:     ' ', // default is '... '
    expandText:       '[Read More]', // default is 'read more'
    collapseTimer:    0, // re-collapses after 5 seconds; default is 0, so no re-collapsing
    userCollapseText: '[Read Less]',
    expandEffect: 'slideDown',
    expandSpeed: 450,
    collapseEffect: 'slideUp',
    collapseSpeed: 400,

  });

});