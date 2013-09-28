define([
    'cajeta',
    'text!app/view/home/homePage.html',
    'model'
], function(cajeta, template, model) {
        // First test classes and extend functionality
        return describe('cajeta.view.Component', function() {
            var component = new cajeta.view.Component({
                cid: 'test',
                modelPath: 'testForm.data',
                modelValue: 'forests'
            });

            var component2 = new cajeta.view.Component({
                cid: 'test2',
                modelPath: 'testForm.data2',
                modelValue: 'super'
            });

            it('throws an exception on instantiation without a cid', function() {
                expect(function() { new cajeta.view.Component(); }).toThrow(cajeta.ERROR_COMPONENT_CID_UNDEFINED);
            });

            it('accepts attribute changes before attaching a template, or docking', function() {
                component.attr('one', 'one');
                expect(component.attr('one')).toEqual('one');
                component.prop('two', 'two');
                expect(component.prop('two')).toEqual('two');
            });

            // TODO: These all need to be rewritten to support the new messaging API
//            it('can be bound to the model', function() {
//                model.subscribe(component, cajeta.message.MESSAGE_MODEL_NODEADDED);
//                expect(function() { component.onComponentChanged() }).not.toThrow();
//                model.subscribe(component2, cajeta.message.MESSAGE_MODEL_NODEADDED);
//                expect(function() { component2.setComponentValue('delicious') }).not.toThrow();
//            });
//
//            it('accepts an html template', function() {
//                component.setTemplate('homePage', template);
//                expect(component.template).toBeDefined();
//            });
//
//            it('can set the model value through the component', function() {
//                component.setComponentValue('three');
//                expect(model.get(component.modelPath,
//                        component.dsid)).toEqual('three');
//            });
//
//            it('Updates component value in response to model changes', function() {
//                model.set(component.modelPath, 'eight', component.dsid);
//                expect(component.getComponentValue()).toEqual('eight');
//            });

//            // TODO: integrate this test
//            it('can be unbound from a component', function() {
//                component.modelChanged = false;
//                model.removeListener(component, cajeta.Events.EVENT_MODELCACHE_CHANGED,
//                    component.getEventOperand());
//                model.set('graphData.childTwo.ten', 'ten');
//                expect(component.modelChanged).toBeFalsy();
//            });
        });
    }
);
