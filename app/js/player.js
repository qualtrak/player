

var playerApp = angular.module('playerApp', []);

playerApp.factory('playerService', ['$http', function($http){
    return new PlayerService($http);
}]);

playerApp.factory('playerModel', ['playerService', function(playerService){
    return new PlayerModel(playerService);
}]);

playerApp.controller('playerController', ['$scope', 'playerModel', '$timeout','$compile', PlayerController]);
//playerApp.controller('playerController', ['$scope', PlayerController]);

function PlayerService($http){

    function query(){
        return null;
    }

    return {
        query: query
    }
}

function RecordingDto (id, name, length){
    var _id = id;
    var _name = name;
    var _length = length;

    this.getId = function(){return _id};
    this.getName = function(){return _name};
    this.getLength = function(){return _length};
}

function PlayerModel(playerService){
    return {
        data : [
            new RecordingDto(1, "test-1.wav", 10),
            new RecordingDto(2, "b.wav", 2),
            new RecordingDto(3, "test-2.wav", 10),
            new RecordingDto(4, "c.mp3", 169)
        ]
    }
}

//function PlayerController($scope, playerModel, $timeout) {
function PlayerController($scope, $timeout, $compile) {
    $scope.isPlayDisabled = false;
    $scope.isStopDisabled = true;
    $scope.isPauseDisabled = true;
    $scope.position = "00 - 00 / 00";
    $scope.recordings = [];

        /*[
        new RecordingDto(1, "audio/test-1.wav", 10),
        new RecordingDto(2, "audio/b.wav", 2),
        new RecordingDto(3, "audio/test-2.wav", 10),
        new RecordingDto(4, "audio/c.mp3", 169)
    ];*/
    $scope.filename = "";
    $scope.currentPosition = 0;
    $scope.totalLength = 0;
    $scope.timeout = null;
    $scope.qtPlayer = null;
    $scope.isPlaying = false;
    $scope.segmentStart = 0;
    $scope.isBookmarkSet = false;
    $scope.bookmarkSliderBroughtIntoView = false;
    $scope.singleSlider = {};
    $scope.doubleSlider = {};
    $scope.isPlayDisabled = true;

    $scope.singleHtml = '<div id="rangeslider" ng-show="!isBookmarkSet" style="width:100%;display: inline-block" ><input /><input /></div>';
    $scope.rangeHtml = '<div id="slider" ng-show="isBookmarkSet" style="width:100%;display: inline-block" ><input /><input /></div>';

    $scope.log = function(message){
        window.console && console.log(message);
    };

    $scope.loadRecordings = function(recordings) {
        angular.copy(recordings, $scope.recordings);

        if ($scope.recordings.length > 0) {
            $scope.filename = $scope.recordings[0].getName();
            $scope.isPlayDisabled = false;
            $scope.init();
            $scope.$apply();
        }
    };

    $scope.play = function (){
        if ($scope.recordings.length == 0) return;

        $scope.isPlayDisabled = true;
        $scope.isStopDisabled = false;
        $scope.setPauseButtonState(false);
        $scope.playForward();

        if ($scope.isBookmarkSet){
            $scope.qtPlayer.SetTime(($scope.start - $scope.segmentStart) * 600);
        } else {
            if ($scope.segmentStart != $scope.currentPosition) {
                $scope.qtPlayer.SetTime(($scope.currentPosition - $scope.segmentStart) * 600);
            }
        }

        window.setTimeout( function () {
            $scope.qtPlayer.Play();
        }, 1000);

        $scope.isPlaying = true;
    };

    $scope.pausedPressed = function (){
        $scope.isPlayDisabled = false;
        $scope.isStopDisabled = true;
        $scope.setPauseButtonState(true);
        $timeout.cancel($scope.timeout);
        $scope.isPlaying = false;

        if ($scope.qtPlayer != null){
            $scope.qtPlayer.Stop();
        }
    }

    $scope.pause = function (){
        $scope.pausedPressed();
    }

    $scope.setBookmark = function(){

        if ($scope.recordings.length == 0) return;

        $scope.isBookmarkSet = true;

        $scope.pausedPressed();
        $scope.start = $scope.currentPosition;

        if ($scope.currentPosition + 5 > $scope.totalLength) {
            $scope.end = $scope.totalLength;
        } else {
            $scope.end = $scope.currentPosition + 5;
        }

        $scope.selectAppropriateSlider();
        $scope.updateSlider($scope.start,$scope.end);
        $scope.updatePositionLabel();
        $scope.$apply();
    }

    $scope.stop = function (resetToZero){
        $scope.isPlayDisabled = false;
        $scope.isStopDisabled = true;
        $scope.setPauseButtonState(true);

        $timeout.cancel($scope.timeout);
        $scope.isPlaying = false;
        if (!$scope.isBookmarkSet && resetToZero) {
            $scope.start = 0;
        }

        $scope.currentPosition = $scope.start;

        try {
            $scope.qtPlayer.Stop();
            $scope.qtPlayer.Rewind();
        } catch (ex) {}
    }

    $scope.setPauseButtonState = function (state){
        if ($scope.isBookmarkSet ) {
            $scope.isPauseDisabled = true;
        } else {
            $scope.isPauseDisabled = state;
        }
    }

    $scope.playForward = function (){
        if ($scope.currentPosition >= $scope.totalLength) {
            $scope.stop();
            return;
        };

        $scope.timeout = $timeout ( function() {
            $scope.currentPosition = parseInt($scope.currentPosition) + 1;
            //$scope.log("playForward = " + $scope.currentPosition);
            $scope.playForward();
            $scope.$apply();
        }, 1000, null);
    }

    $scope.$watch('filename', function (newValue, oldValue) {
        //$scope.log (newValue + " " + oldValue);
        if (newValue != oldValue) {
            //$scope.log($scope.currentPosition + " == " + $scope.segmentStart + " " + $scope.filename);
            $scope.qtPlayer = document.getElementById($scope.getRecordingByFilename($scope.filename));
            window.setTimeout( function () {
                if ($scope.isPlaying) {
                    $scope.qtPlayer.Play();
                }
            }, 100);
        }
    });

    $scope.$watch('currentPosition', function (newValue, oldValue) {
        if (newValue === oldValue) return;

        var cumLength = 0;
        angular.forEach($scope.recordings, function(value, key){
            if ($scope.currentPosition > cumLength &&
                $scope.currentPosition < (cumLength + value.getLength())){
                $scope.segmentStart = cumLength;
                //$scope.log ("setting segment start " + $scope.segmentStart + " for " + value.getName() + " " + $scope.currentPosition);
                $scope.filename = value.getName();
            }
            cumLength = cumLength + value.getLength();
        }, null);

        $scope.log ("current pos: " + $scope.currentPosition);

        if ($scope.isBookmarkSet) {
            if (newValue >= $scope.end){
                $scope.stop()
            }
        } else {
            if (newValue >= $scope.totalLength){
                $scope.stop()
            }
        }

        if (!$scope.isBookmarkSet){
            $scope.updateSlider($scope.currentPosition);
        }

        $scope.updatePositionLabel();
    });

    $scope.updatePositionLabel = function (){
        if ($scope.isBookmarkSet) {
            $scope.position = $scope.convertToTime($scope.start) + " (" + $scope.convertToTime($scope.currentPosition) + ") " + $scope.convertToTime($scope.end) + " / " + $scope.convertToTime($scope.totalLength);
        } else {
            $scope.position = $scope.convertToTime($scope.currentPosition) + " / " + $scope.convertToTime($scope.totalLength);
        }
    }

    $scope.convertToTime = function (seconds) {

        var hr = Math.floor(seconds / 3600);
        var min = Math.floor((seconds - (hr * 3600))/60);
        var sec = seconds - (hr * 3600) - (min * 60);

        while (min.length < 2) {min = '0' + min;}
        while (sec.toString().length < 2) {sec = '0' + sec;}
        if (hr) hr += ':';
        return hr + min + ':' + sec;
    }

    $scope.createQtPlayerObject = function (name, url){
        var str = '<embed name="' + name + '" id="' + name + '" width="0px" height="0px" AUTOPLAY="false" src="' + url + '" TYPE="video/quicktime" PLUGINSPAGE="www.apple.com/quicktime/download" enablejavascript="true">';
        str += '  </embed> ';
        return str;
    }

    $scope.updateSlider = function (start, end)
    {
        if ($scope.isBookmarkSet) {
            $scope.slider.values(start,end);
        } else {
            $scope.slider.value(start);
        }
    };

    $scope.selectAppropriateSlider = function() {

        $scope.createSliders();
        //$('#rangeslider').empty();

        if ($scope.isBookmarkSet){
            if ($scope.bookmarkSliderBroughtIntoView) return;
            $scope.slider = $scope.doubleSlider;
            $scope.bookmarkSliderBroughtIntoView = true;
            $scope.log("selected range slider");
        } else {
            $scope.slider = $scope.singleSlider;
            $scope.log("selected single slider");
        }
    }

    $scope.createSliders = function() {

        $('#sliderDiv').empty();

        if ($scope.isBookmarkSet) {
            $compile($scope.singleHtml)($scope).appendTo(($('#sliderDiv')));

            $scope.doubleSlider = $('#rangeslider').kendoRangeSlider({
                min: 0,
                max: $scope.totalLength,
                smallStep: 1,
                largeStep: 1,
                tickPlacement: "none",
                showButtons: false,
                tooltip: { enabled: false},
                slide: function (e) {
                    $scope.start = e.values[0];
                    $scope.currentPosition = e.values[1];
                    $scope.end = e.values[1];
                    $scope.$apply(function () {
                        $scope.updatePositionLabel();
                    });
                    $scope.isPlayDisabled = false;
                    $scope.isPauseDisabled = true;
                    $scope.stop();
                },
                value: 10
            }).data("kendoRangeSlider");

        }
        else {
            $compile($scope.rangeHtml)($scope).appendTo(($('#sliderDiv')));

            $scope.singleSlider = $('#slider').kendoSlider({
                min: 0,
                max: $scope.totalLength,
                smallStep: 1,
                largeStep: 1,
                tickPlacement: "none",
                showButtons: false,
                tooltip: { enabled: true},
                slide: function (e) {
                    $scope.start = e.value;
                    $scope.currentPosition = e.value;
                    // $scope.log($scope.start + " " + $scope.currentPosition);
                    $scope.$apply(function () {
                        $scope.updatePositionLabel();
                    });
                    $scope.isPlayDisabled = false;
                    $scope.isPauseDisabled = true;
                    $scope.stop();
                },
                value: 10
            }).data("kendoSlider");
        }

    }

    $scope.init = function (){
        var html = "";
        angular.forEach($scope.recordings, function(value, key){
            html = html + $scope.createQtPlayerObject("qt_" + value.getId(), value.getName());
            $scope.totalLength = $scope.totalLength + value.getLength();
        }, null);

        $('#mediaPlayer').html(html);


        $scope.selectAppropriateSlider();

        if ($scope.end != 0) {
            $scope.start = parseInt($scope.start);
            $scope.end = parseInt($scope.end);
            $scope.currentPosition = $scope.start;
            $scope.isBookmarkSet = true;
            $scope.isPlayDisabled = false;
            $scope.setPauseButtonState(true);
            $scope.updatePositionLabel();
            $scope.updateSlider($scope.start,$scope.end);
        } else {
            $scope.start = 0;
            $scope.end = 0;
            $scope.updateSlider($scope.start, null);
            $scope.updatePositionLabel();
        }
    };

    $scope.getRecordingByFilename = function (filename) {
        var elem = null;
        angular.forEach($scope.recordings, function(value, key){
            if (value.getName() == filename){
                elem = "qt_" + value.getId();
            }
        }, null);

        return elem;
    };

    $scope.save = function(){
        $scope.stop();
        document.savedCallback($scope.start, $scope.end);
        $scope.isBookmarkSet = false;
        $scope.bookmarkSliderBroughtIntoView = false;
        $scope.selectAppropriateSlider();
        $scope.updateSlider($scope.start, null);
        $scope.updatePositionLabel();
    };

    $scope.cancel = function(){
        $scope.stop();
        document.cancelCallback();
        $scope.isBookmarkSet = false;
        $scope.bookmarkSliderBroughtIntoView = false;
        $scope.selectAppropriateSlider();
        $scope.updateSlider($scope.start, null);
        $scope.updatePositionLabel();
    };
}

playerApp.directive('player', function (playerModel){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/templates/directives/player.html',
        scope: {
            start: "@",
            end: "@"
        },
        controller: 'PlayerController'
    }
});




