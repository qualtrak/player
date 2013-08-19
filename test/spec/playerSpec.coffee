'use strict'

describe "Player App suite", ->

  rootScope = {}
  compile = null
  ctrl = {}
  elem = null

  describe "Player App controller", ->

    it "contains spec with an expectation", ->
      expect(true).toBe(true)

  describe "Player App controller", ->

    beforeEach module("playerApp")
    #beforeEach module("../app/templates/directives/player.html")

    ### beforeEach inject ($rootScope, $controller, $compile) ->
        scope = $rootScope.$new()
        playerModel = PlayerModel null
        elem = angular.element('<player></player>')
        $compile(elem)($rootScope)
        ctrl = angular.element.controller "playerController", {$scope: scope, playerModel: playerModel, $timeout: {}}###

        #ctrl = $controller("PlayerController", {$scope: scope, playerModel: playerModel, $timeout: {}})


    ### beforeEach inject ($rootScope, $controller, $timeout, $compile) ->
      scope = $rootScope
      elem = $compile('<player></player>')(scope)

      playerModel = PlayerModel null

      console.log "html -> ", elem.html()
      ctrl = $controller "PlayerController", {$scope: scope, playerModel: playerModel, $timeout: {}}###

    beforeEach inject ($rootScope, $compile) ->
      rootScope = $rootScope
      compile = $compile

    it "should have  rangeslider rendered", ->
      elem = compile("<player></player>")(rootScope)
      console.log(elem.html())
      expect(elem.html()).toContain("rangeslider")

    xit "should have rangeslider rendered", ->
      #expect(elem.html()).to.match(/rangeslider/i)
      expect(true).toBe(true)

    xit "should gave start set to zero", ->
      expect(scope.start).toBe(0)


      #element '<div id="rangeslider" style="width:30%; float: left;" ng-model="slider"><input /><input /></div>'
      #expect(elem.text()).toContain("rangeslider")



