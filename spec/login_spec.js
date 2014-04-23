
var Login = require('./pages').login;

describe('login', function() {
    'use strict';

    var modal;

    beforeEach(function() {
        browser.get('/');
        browser.executeScript('sessionStorage.clear();localStorage.clear();');
        modal = new Login();
    });

    it('renders modal on load', function() {
        expect(modal.btn).toBeDisplayed();
    });

    it('can login', function() {
        modal.login('admin', 'admin');
        expect(modal.btn).not.toBeDisplayed();
        expect(browser.getCurrentUrl()).toBe('http://localhost:9090/#/dashboard');
        expect(element(by.binding('UserName')).getText()).toContain('john');
    });

    it('can logout', function() {
        modal.login('admin', 'admin');
        element(by.binding('UserName')).click();
        element(by.buttonText('SIGN OUT')).click();

        protractor.getInstance().sleep(500); // it reloads page
        protractor.getInstance().waitForAngular();

        expect(modal.btn).toBeDisplayed();
        expect(modal.username).toBeDisplayed();
        expect(modal.username.getAttribute('value')).toBe('');
    });

    it('should not login with wrong credentials', function() {

        var mockBackend = function() {
            var mock = angular.module('test', ['ngMockE2E']);
            mock.run(function($httpBackend) {
                $httpBackend.whenGET(/.html$/).passThrough();
                $httpBackend.whenPOST(/\/Security\/Authentication/).respond({Token: 'x'});
                $httpBackend.whenPOST(/\/Security\/Login/).respond(400, {});
            });
        };

        protractor.getInstance().addMockModule('superdesk', mockBackend);
        browser.get('/');

        expect(modal.btn).toBeDisplayed();
        modal.login('admin', 'wrongpass');
        expect(modal.btn).toBeDisplayed();
        expect($('.error')).toBeDisplayed();
    });

    afterEach(function() {
        browser.clearMockModules();
    });
});
