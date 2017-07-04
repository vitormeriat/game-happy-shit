
    var w8_Mode = 1;
    var canvas;// = document.getElementById('canvasGame');
    var ctx; // = canvas.getContext('2d');
    var attemptFPS = 0;
    var loaded = 0;
    var currentGameTime = 0;

    var deepControl = new DeepControl();

    var CameraAltitudeReal = 0; // A altitude real da camera fica na verdade bem no topo do jogo... OBS.: Use o ChangePositon para mudar a posição
    var CameraAltitudeVirtual = 0; // ... por isso a necessidade do virtual que fica no chão. OBS.: Use o ChangePositon para mudar a posição
    var newCameraAltitude = 0; // OBS.: Use o ChangePositon para mudar a posição
    var CameraSpecialPosition = new Vector2(0, 0);
    var isCameraAnimating = 0;
    var firstAltitude = 0;

    var gameDashboardPosition = new Vector2(0, 0);
    var gameDashboardSize = new Size(0, 0);
    var gameDashboarMarginSide;

    var IsHolding = false;
    var IsHoldingStartAltitude = 0;
    var IsHoldingCurrentAltitude = 0;

    var nextAltitude = 31; // altitude do primeiro nest

    var listLandingPlaces = new Array();

    var _storeNest1 = new Nest(0, 0); // Nest que vai guardar algumas imagens e propriedades padrões

    var forceResize = false;

    var shit = new Shit();
    var shitDefault = new Shit();

    var currentScreen = 0;// 0 = Menu, 1 Gameplay, 3 Final Screen

    var menuScreen = new MenuScreen();
    var gameOverScreen = new GameoverScreen();
    var userHelp = new UserHelp();

    var isPaused = false;
    var isPausedOpacity = 0;

    var userPoints = 0;
    var userPointsScreen = 0; // Valor que é mostrado na tela
    var isSnnaped = false;

    var fromSuspend = false; // se entrar no estado durmant...

    var soundBump = new Audio("sounds/bump.wav");
    var nestLanding = new Audio("sounds/land.wav");
    var stretchSound = new Audio("sounds/stretch.wav");

    function Game() {

        canvas = document.getElementById('canvasGame');
        ctx = canvas.getContext('2d');

        var imgExemplo = new Image();

        var tempImgRoof = new Image(),
        tempImgNestNormalFront = new Image(),
        tempImgNestNormalBack = new Image(),
        tempImgShit = new Image(),
        tempTest = new Image(),
        tempMenuLogoImage = new Image(),
        tempTbPlay = new Image(),
        tempBtPlayImage = new Image(),
        tempBrokenShitImage = new Image(),
        tempHand = new Image();

        var loader = new PxLoader(),
        tempImgRoof = loader.addImage('images/fundobanheiro.png'), 
        tempImgNestNormalFront = loader.addImage('images/bostanestFrontFull.png'),
        tempImgNestNormalBack = loader.addImage('images/bostanestBackFull.png'), 
        tempImgShit = loader.addImage('images/heroibosta.png'),
        tempMenuLogoImage = loader.addImage('images/logoFinal.png'),
        tempTbPlay = loader.addImage('images/btPlay.png'),
        tempBtPlayImage = loader.addImage('images/btPlayAgain.png'),
        tempBrokenShitImage = loader.addImage('images/bostaperdedora.png'),  
        tempHand = loader.addImage('images/hand.png');

        loader.addCompletionListener(function () {

            loaded = 1;
            deepControl.RoofImage = tempImgRoof;
            deepControl.RoofImage.width = 2100;
            deepControl.RoofImage.height = 1200;
            deepControl.RoofSize = new Size(deepControl.RoofImage.width, deepControl.RoofImage.height);

            userHelp.ImgHand = tempHand;

            tempImgNestNormalFront.width *= 0.7;
            tempImgNestNormalFront.height *= 0.7;
            tempImgShit.width *= 0.4;
            tempImgShit.height *= 0.4;

            _storeNest1.ImgNestFront = tempImgNestNormalFront;
            _storeNest1.ImgNestBack = tempImgNestNormalBack;

            menuScreen.menuLogoImage = tempMenuLogoImage;
            menuScreen.btPlayImage = tempTbPlay;
            gameOverScreen.btPlayAgainImage = tempBtPlayImage;
            gameOverScreen.figShitDestroiedImage = tempBrokenShitImage;

            shitDefault.ImgShit = tempImgShit;
            shitDefault.Size = new Size(shitDefault.ImgShit.width, shitDefault.ImgShit.height);

            // deixe por ultimo
            forceResize = true;

            // suspend
            if (fromSuspend) {

                var applicationData = Windows.Storage.ApplicationData.current;

                userPoints = app.sessionState.userPoints;
                userPointsScreen = userPoints;

                shit = new Shit();
                listLandingPlaces = new Array();

                currentScreen = app.sessionState.currentScreen;

                var listLandingPlacesRescued = JSON.parse(app.sessionState.listLandingPlaces);

                firstAltitude = 0;
                nextAltitude = 0;

                switch (currentScreen) {

                    case 0:// menu
                        // nao fazer nada
                        break;

                    case 1: // gameplay
                        //continueGame(listLandingPlacesRescued[0].Place.Altitude, listLandingPlacesRescued[listLandingPlacesRescued.length - 1].Place.Altitude);
                        userHelp.NextTimeShow = currentGameTime + 5;
                        currentScreen = 1;
                        var shitRescued = JSON.parse(app.sessionState.shit);
                        shit.Altitude = shitRescued.Altitude;
                        shit.Latitude = shitRescued.Latitude;
                        shit.Rotation = shitRescued.Rotation;

                        for (var i = 0; i < listLandingPlacesRescued.length; i++) {
                            listLandingPlaces[i] = new LandingPlace(1, listLandingPlacesRescued[i].Place.Altitude, listLandingPlacesRescued[i].Place.Latitude, 0, listLandingPlacesRescued[i].Place.LatitudeSpeed, listLandingPlacesRescued[i].Place.CurrentDirection);
                            listLandingPlaces[i].Place.ImgNestFront = _storeNest1.ImgNestFront;
                            listLandingPlaces[i].Place.ImgNestBack = _storeNest1.ImgNestBack;

                            var placeAltitude = Math.round(listLandingPlacesRescued[i].Place.Altitude + 1);
                            var shitAltitude = Math.round(shit.Altitude);

                            if (placeAltitude == shitAltitude)
                                shit.CurrentLandingPlace = listLandingPlaces[i];
                        }

                        shit.ImgShit = shitDefault.ImgShit;
                        shit.Size = shitDefault.Size;

                        firstAltitude = app.sessionState.firstAltitude;
                        nextAltitude = listLandingPlacesRescued[listLandingPlacesRescued.length - 1].Place.Altitude;

                        menuScreen.showMenu = false;

                        ChangeCameraPosition(shit.CurrentLandingPlace.Place.Altitude - 26, false);

                        break;
                    case 2: // lost screen

                        gameOverScreen.highestPoints = applicationData.localSettings.values["highScore"];

                        if (gameOverScreen.highestPoints == undefined)
                            gameOverScreen.highestPoints = 0;

                        gameOverScreen.points = app.sessionState.userPoints;

                        menuScreen.showMenu = false;
                        gameOverScreen.show();
                        gameOverScreen.screenOpacity = 1;

                        ChangeCameraPosition(firstAltitude, false);

                        break;
                }
            }
        });

        canvas.addEventListener('mousedown', function (e) {
            if (currentScreen == 1) {
                if (e.layerY > shit.CurrentLandingPlace.Place.Position.Y && e.layerY < shit.CurrentLandingPlace.Place.Position.Y + shit.CurrentLandingPlace.Place.Size.Height) {
                    IsHolding = true;
                    IsHoldingStartAltitude = GetAltitudeByRealY(e.layerY);
                }
            }
        }, false);

        canvas.addEventListener('mousemove', function (e) {
            if (currentScreen == 1) {
                if (IsHolding) {
                    IsHoldingCurrentAltitude = GetAltitudeByRealY(e.layerY);
                    shit.CurrentLandingPlace.Place.Pull(IsHoldingStartAltitude, IsHoldingCurrentAltitude);
                }
            }
        }, false);

        canvas.addEventListener('mouseup', function (e) {
            if (currentScreen == 1) {
                IsHolding = false;
                shit.CurrentLandingPlace.Place.Release();
            }
        }, false);

        canvas.addEventListener('click', function (e) {
            if (isPaused && !isSnnaped) {
                isPaused = false;
            } else if (menuScreen.showMenu) {

                newGame();
                userHelp.NextTimeShow = currentGameTime + 5;
                currentScreen = 1;

            } else if (gameOverScreen.showScreen) {
                newGame();
                gameOverScreen.hide();
                currentScreen = 1;
            }
        }, false);

        document.onkeyup = function (e) {
            if (e.keyCode == 32) { // espaço
                
            } else if (e.keyCode == 13) {
                
            }
        };

        loader.start();

        // Controle de FPS e DeltaTime
        lastTime = new Date();
        setInterval(function () {
            var valorFPS = Math.round(1000 / (1000 * deltaTime))
            fpsValue = valorFPS + " fps";

            if (valorFPS < 55) {
                attemptFPS++;

                if (attemptFPS > 5) {
                    //fpsStandard = 30;// Desabilitado por enquanto o controle de 30 fps
                }
            } else {
                attemptFPS = 0;
            }
        }, 500);

        update();//StartFPS();

    }

    var triggerBugFPS = false;

    function newGame() {
        listLandingPlaces = new Array();
        shit = new Shit();
        shit.ImgShit = shitDefault.ImgShit;
        shit.Size = shitDefault.Size;

        firstAltitude = CameraAltitudeReal + 20;

        menuScreen.showMenu = false;
        GenerateNests(firstAltitude, true);

        ChangeCameraPosition(firstAltitude - 26, true);

        shit.CurrentLandingPlace = listLandingPlaces[0]; // só para testes
    }

    function continueGame(_firstAltitude, _nextAltitude) {
        listLandingPlaces = new Array();
        shit = new Shit();
        shit.ImgShit = shitDefault.ImgShit;
        shit.Size = shitDefault.Size;

        firstAltitude = _firstAltitude + 20;
        nextAltitude = _nextAltitude;

        menuScreen.showMenu = false;

        ChangeCameraPosition(firstAltitude - 26, true);

        shit.CurrentLandingPlace = listLandingPlaces[0]; // só para testes
    }

    function update() {

        if (triggerBugFPS == false)
            triggerBugFPS = true;
        else
            triggerBugFPS = false;

        if (triggerBugFPS) {

            if (forceResize) {
                resize();
                forceResize = false;
            }

            // Controle de FPS e DeltaTime
            var newTime = new Date();
            var newDeltaTime = (newTime - lastTime) / 1000;
            lastTime = newTime;
            deltaTime = newDeltaTime;

            // Se o jogo ficar pausado (de alguma forma) por mais de 300 milésimos, levar em consideração o último deltaTime.
            if (newDeltaTime > 0.3) {
                deltaTime = 60 / 1000;
            }

            if (loaded) {
                if (!isPaused) {

                    if (CameraAltitudeReal + 110 > nextAltitude && !menuScreen.showMenu) {
                        GenerateNests(nextAltitude, false);
                    }

                    if (newCameraAltitude != CameraAltitudeReal) {
                        var distance = newCameraAltitude - CameraAltitudeReal;
                        distance *= 0.04;
                        CameraAltitudeReal = CameraAltitudeReal + distance;
                        isCameraAnimating = 1;
                    } else {
                        isCameraAnimating = 0;
                    }

                    deepControl.update();

                    menuScreen.update();

                    switch (currentScreen) {

                        case 0: // Menu inicial

                            break;

                        case 1:// Gameplay

                            shit.update();

                            for (var i = 0; i < listLandingPlaces.length; i++) {
                                if (listLandingPlaces[i].Place.Altitude < CameraAltitudeReal + 25) {
                                    listLandingPlaces[i].update();

                                    if (listLandingPlaces[i].IsToDelete) {
                                        listLandingPlaces.splice(i, 1);
                                    }
                                }
                            }

                            break;
                    }

                    if (userPoints != userPointsScreen) {
                        var distance = userPoints - userPointsScreen;
                        distance *= 0.1;
                        userPointsScreen += distance;
                    }

                    gameOverScreen.update();
                    currentGameTime += deltaTime;

                } else {
                    resize();
                }

                if (isPaused && isPausedOpacity < 1)
                    isPausedOpacity += 0.05;
                else if (!isPaused && isPausedOpacity > 0)
                    isPausedOpacity -= 0.05;

                userHelp.update();

                //Deixar sempre no final
                draw();
            }
        }

        setTimeout(update, 1000 / fpsStandard);
    }
    
    function draw() {

        ctx.fillStyle = "#a2c9ea";
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, document.documentElement.offsetWidth, document.documentElement.offsetHeight);

        deepControl.draw(ctx);
        
        if (currentScreen == 1) {
            for (var i = 0; i < listLandingPlaces.length; i++) {
                listLandingPlaces[i].Place.draw(ctx, 0);
            }
            shit.draw(ctx, 0);
            for (var i = 0; i < listLandingPlaces.length; i++) {
                listLandingPlaces[i].Place.draw(ctx, 1);
            }
            shit.draw(ctx, 1);
        }

        ctx.save();
        if (currentScreen == 1) {
            ctx.globalAlpha = 0.75;

            if (menuScreen.showMenuOpacity > 0) {
                ctx.globalAlpha = (1 - menuScreen.showMenuOpacity) * 0.75;
            }

            if (gameOverScreen.screenOpacity > 0) {

                ctx.globalAlpha = (1 - gameOverScreen.screenOpacity) * 0.75;
            }

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, document.documentElement.offsetWidth, gameDashboardSize.Height * 0.05);

            ctx.restore();

            ctx.save();

            if (menuScreen.showMenuOpacity > 0) {
                ctx.globalAlpha = 1 - menuScreen.showMenuOpacity;
            }

            if (gameOverScreen.screenOpacity > 0) {

                ctx.globalAlpha = (1 - gameOverScreen.screenOpacity);
            }

            ctx.fillStyle = "black";
            ctx.font = gameDashboardSize.Height * 0.04 + "px Segoe UI";

            ctx.fillText("Points: " + Math.round(userPointsScreen), gameDashboardPosition.X, gameDashboardSize.Height * 0.04);
            ctx.restore();
        }

        menuScreen.draw(ctx);
        gameOverScreen.draw(ctx);

        if (isPausedOpacity > 0) {
            ctx.save();
            ctx.globalAlpha = isPausedOpacity * 0.7;
            ctx.fillRect(0, 0, document.documentElement.offsetWidth, document.documentElement.offsetHeight);

            var pauseText;

            ctx.restore();
            ctx.save();
            ctx.fillStyle = "white";
            ctx.globalAlpha = isPausedOpacity;
            ctx.font = document.documentElement.offsetHeight * 0.09 + "px Segoe UI";

            pauseText = new Vector2((document.documentElement.offsetWidth / 2) - (ctx.measureText("Paused").width / 2), document.documentElement.offsetHeight * 0.55);

            ctx.fillText("Paused", pauseText.X, pauseText.Y);
            ctx.restore();
        }

        userHelp.draw(ctx);
    }

    function GenerateNests(_staringAltitude, _firstGen) {

        var numberExistingLandingPlaces = 0;
        var nextMustHighSpeed = false;
        var maxDistanceBetween = 0;
        var minDistanceBetween = 0;

        if (_staringAltitude - firstAltitude < 300) {
            maxDistanceBetween = 25;
        }
        else if (_staringAltitude - firstAltitude < 500) {
            maxDistanceBetween = 35;
        }
        else {
            maxDistanceBetween = 40;
        }

        if (_staringAltitude - firstAltitude < 300) {
            minDistanceBetween = 15;
        }
        else if (_staringAltitude - firstAltitude < 500) {
            minDistanceBetween = 25;
        }
        else {
            minDistanceBetween = 35;
        }

        if (listLandingPlaces != null) {
            numberExistingLandingPlaces = listLandingPlaces.length;
        }

        for (var i = numberExistingLandingPlaces; i < numberExistingLandingPlaces + 10; i++) {

            var newNestLatitude = Math.random() * 100;
            var newNestSpeed = Math.random() * 20;
            var newNestFirstDirection = Math.random();


            if (newNestFirstDirection > 0.5)
                newNestFirstDirection = -1;
            else
                newNestFirstDirection = 1;

            var altitudeNotReady = true;
            while (altitudeNotReady) {

                var newNestAltitude = Math.random() * maxDistanceBetween;
                if (newNestAltitude >= minDistanceBetween) {
                    newNestAltitude += nextAltitude;

                    altitudeNotReady = false;
                }
            }

            if (i == 0 && _firstGen) {
                newNestAltitude = _staringAltitude;
                _firstGen = false;
            }

            if (_staringAltitude == 0 && i == 0) {
                //newNestSpeed = 5;
            }

            if (nextMustHighSpeed) {
                newNestSpeed += 10;
                nextMustHighSpeed = false;

                if (newNestSpeed > 20)
                    newNestSpeed = 20;
            } else if (newNestSpeed < 3) {
                nextMustHighSpeed = true;
            }

            nextAltitude = newNestAltitude;

            listLandingPlaces[i] = new LandingPlace(1, newNestAltitude, newNestLatitude, 0, newNestSpeed, newNestFirstDirection);

            listLandingPlaces[i].Place.ImgNestFront = _storeNest1.ImgNestFront;
            listLandingPlaces[i].Place.ImgNestBack = _storeNest1.ImgNestBack;

        }

        forceResize = true;
    }

    function GetAltitudeY(_altitude) {
        /// <summary>Converte a altitude real do objeto a partir da camera.</summary>
        /// <returns type="Number">Valor real da altura.</returns>
        var currentConvertedCameraAltitude = CameraAltitudeReal * document.documentElement.offsetHeight / 100;
        var currentConvertedObjectAltitude = _altitude * document.documentElement.offsetHeight / 100;
        return currentConvertedCameraAltitude - currentConvertedObjectAltitude;
    }

    function GetLatitude(_latitude) {
        /// <summary>Converte a altitude real do objeto a partir da camera.</summary>
        /// <returns type="Number">Valor da latitude de 0 a 100.</returns>
        return gameDashboardPosition.X + (_latitude * (gameDashboardSize.Width / 100));
    }

    function GetAltitudeByRealY(_altitude) {
        /// <summary>Converte a altitude real do objeto a partir da camera.</summary>
        /// <returns type="Number">Valor real da altura.</returns>
        //var currentConvertedCameraAltitude = CameraAltitudeReal * 100 / document.documentElement.offsetHeight;
        var currentConvertedObjectAltitude = _altitude * 100 / document.documentElement.offsetHeight;
        //return currentConvertedCameraAltitude - currentConvertedObjectAltitude;

        return (CameraAltitudeVirtual - currentConvertedObjectAltitude) + 100;
    }


    function ChangeCameraPosition(_newAltitude, animation) {
        /// <summary>Função feita para mudar a posição da camera. Algo de nota é que a camera por padrao é posicionada no meio da tela.</summary>
        /// <param name="_newAltitude" type="Number">Nova altura que vai ficar a altitude.</param>
        /// <param name="_newAltitude" type="Bool">Se deve ter animação ou não.</param>

        if (animation)
            newCameraAltitude = _newAltitude + 100; // Por ficar no meio da tela, vem do +50.
        else {
            newCameraAltitude = _newAltitude + 100;
            CameraAltitudeReal = _newAltitude + 100;
        }

        CameraAltitudeVirtual = _newAltitude;

    }

    function resize() {
        if (ctx != null) {
            if (!w8_Mode) {
                ctx.document.documentElement.offsetWidth = window.innerWidth;
                ctx.document.documentElement.offsetHeight = window.innerHeight;
            } else {
                //var resolutionScale = Windows.Graphics.Display.DisplayProperties.resolutionScale;
                var _body = document.getElementsByTagName('body');

                var height = screen.height; //_body[0].offsetHeight;

                var width = screen.width;//_body[0].offsetWidth;
                //$('#resolution').text('Height: ' + height + ' Width: ' + width + ' ResolutionScale: ' + resolutionScale);

                ctx.canvas.width = width;//window.innerWidth;
                ctx.canvas.height = height;//window.innerHeight;
            }

            //#W8
            var myViewState = Windows.UI.ViewManagement.ApplicationView.value;
            var viewStates = Windows.UI.ViewManagement.ApplicationViewState;

            if (myViewState == viewStates.snapped) {
                isPaused = true;
                isSnnaped = true;

            } else {
                isSnnaped = false;
            }

            deepControl.RoofSize.Height = GetResolutionHeight(deepControl.RoofImage.height);
            deepControl.RoofSize.Width = GetResolutionWidth(deepControl.RoofImage.width, deepControl.RoofImage.height, deepControl.RoofSize.Height);
            deepControl.resize();

            userHelp.resize();

            gameDashboardSize.Height = document.documentElement.offsetHeight;
            gameDashboardSize.Width = GetResolutionWidth(665, 1200, gameDashboardSize.Height);
            gameDashboardPosition.X = (document.documentElement.offsetWidth / 2) - (gameDashboardSize.Width / 2);
            gameDashboarMarginSide = gameDashboardPosition.X;

            for (var i = 0; i < listLandingPlaces.length; i++) {
                if (listLandingPlaces[i].ID == 1) {
                    listLandingPlaces[i].Place.Size.Height = GetResolutionHeight(listLandingPlaces[i].Place.ImgNestFront.height);
                    listLandingPlaces[i].Place.Size.Width = GetResolutionWidth(listLandingPlaces[i].Place.ImgNestFront.width, listLandingPlaces[i].Place.ImgNestFront.height, listLandingPlaces[i].Place.Size.Height);
                }
            }

            shit.Size.Height = GetResolutionHeight(shit.ImgShit.height);
            shit.Size.Width = GetResolutionWidth(shit.ImgShit.width, shit.ImgShit.height, shit.Size.Height);

            menuScreen.resize(canvas);
            gameOverScreen.resize(ctx);

        }
    }

    /****************************** Screens ********************************/
    function MenuScreen() {
        this.menuLogoImage = new Image();
        this.showMenuOpacity = 0;
        this.showMenu = true;
        this.menuLogoPosition = new Vector2(0, 0);
        this.menuLogoSize = new Size(1, 1);

        this.btPlayImage = new Image();
        this.menuBtPlayPosition = new Vector2(0, 0);
        this.menuBtPlaySize = new Size(1, 1);


        this.resize = function (_canvas) {
            this.menuLogoSize.height = GetResolutionHeight(this.menuLogoImage.height);
            this.menuLogoSize.width = GetResolutionWidth(this.menuLogoImage.width, this.menuLogoImage.height, this.menuLogoSize.height);
            this.menuLogoPosition.X = (document.documentElement.offsetWidth / 2) - (this.menuLogoSize.width / 2);
            this.menuLogoPosition.Y = document.documentElement.offsetHeight * 0.05;

            this.menuBtPlaySize.height = GetResolutionHeight(this.btPlayImage.height);
            this.menuBtPlaySize.width = GetResolutionWidth(this.btPlayImage.width, this.btPlayImage.height, this.menuBtPlaySize.height);
            this.menuBtPlayPosition.X = (document.documentElement.offsetWidth / 2) - (this.menuBtPlaySize.width / 2);
            this.menuBtPlayPosition.Y = document.documentElement.offsetHeight * 0.68;
        }

        this.update = function () {
            if (!this.showMenu && this.showMenuOpacity > 0) {
                this.showMenuOpacity *= 0.9;
                if (this.showMenuOpacity < 0) {
                    this.showMenuOpacity = 0;
                }

            } else if (this.showMenu && this.showMenuOpacity < 1) {
                this.showMenuOpacity += 0.05;
                if (this.showMenuOpacity > 1) {
                    this.showMenuOpacity = 1;
                }

            }
            if (this.showMenu) {

                ChangeCameraPosition(CameraAltitudeVirtual + (10 * deltaTime), false);
            }
        }

        this.draw = function (_ctx) {
            if (this.showMenuOpacity > 0) {
                //var currentMenuHeight = GetResolutionHeight(menuImage.height);
                //var currentMenuWidth = GetResolutionWidth(menuImage.width,
                _ctx.save();
                _ctx.globalAlpha = this.showMenuOpacity;
                _ctx.drawImage(this.menuLogoImage, this.menuLogoPosition.X, this.menuLogoPosition.Y, this.menuLogoSize.width, this.menuLogoSize.height);
                _ctx.drawImage(this.btPlayImage, this.menuBtPlayPosition.X, this.menuBtPlayPosition.Y, this.menuBtPlaySize.width, this.menuBtPlaySize.height);

                _ctx.restore();
            }
        }
    }

    function GameoverScreen() {
        this.btPlayAgainImage = new Image();
        this.btPlayAgainPosition = new Vector2(0, 0);
        this.btPlayAgainSize = new Size(1, 1);

        this.figShitDestroiedImage = new Image();
        this.figShitDestroiedPosition = new Vector2();
        this.figShitDestroiedSize = new Size();

        this.points = 0;
        this.highestPoints = 0;

        this.screenOpacity = 0;
        var newScreenOpacity = 0;
        this.showScreen = false;

        var gameOverTextPosition = new Vector2(0, 0),
        label1 = new Vector2(0, 0),
        label2 = new Vector2(0, 0),
        label3 = new Vector2(0, 0),
        label4 = new Vector2(0, 0);

        this.draw = function (_ctx) {

            if (this.screenOpacity > 0) {
                _ctx.save()

                _ctx.globalAlpha = this.screenOpacity;

                _ctx.fillStyle = "#42220f";
                //_ctx.font = gameDashboardSize.Height * 0.1 + "px Segoe UI";
                //_ctx.fillText("Game Over", gameOverTextPosition.X, gameOverTextPosition.Y);

                _ctx.font = gameDashboardSize.Height * 0.028 + "px Segoe UI";
                _ctx.fillText("Your score:", label1.X, label1.Y);
                _ctx.fillText("Your highest score:", label3.X, label3.Y);

                _ctx.font = gameDashboardSize.Height * 0.055 + "px Segoe UI";
                _ctx.fillText(this.points + " Points", label2.X, label2.Y);

                _ctx.font = gameDashboardSize.Height * 0.055 + "px Segoe UI";
                _ctx.fillText(this.highestPoints + " Points", label4.X, label4.Y);

                _ctx.drawImage(this.btPlayAgainImage, this.btPlayAgainPosition.X, this.btPlayAgainPosition.Y, this.btPlayAgainSize.Width, this.btPlayAgainSize.Height);
                _ctx.drawImage(this.figShitDestroiedImage, this.figShitDestroiedPosition.X, this.figShitDestroiedPosition.Y, this.figShitDestroiedSize.Width, this.figShitDestroiedSize.Height);

                _ctx.restore();
            }

        }

        this.update = function () {

            if (newScreenOpacity != this.screenOpacity) {
                var distance = newScreenOpacity - this.screenOpacity;
                distance *= 0.1;
                this.screenOpacity = this.screenOpacity + distance;
            }

            if (this.screenOpacity >= 0.9 && this.showScreen) {
                currentScreen = 2;
            }
        }

        this.resize = function (_ctx) {
            _ctx.save();

            //_ctx.font = gameDashboardSize.Height * 0.1 + "px Segoe UI";
            //gameOverTextPosition.X = (document.documentElement.offsetWidth / 2) - (_ctx.measureText("Game Over").width / 2);
            //gameOverTextPosition.Y = document.documentElement.offsetHeight * 0.12;

            _ctx.font = gameDashboardSize.Height * 0.028 + "px Segoe UI";
            //Título Seus pontos
            label1.X = gameDashboardPosition.X + (gameDashboardSize.Width * 0.15);
            label1.Y = gameDashboardSize.Height * 0.05;
            label3.X = gameDashboardPosition.X + (gameDashboardSize.Width * 0.15);
            label3.Y = gameDashboardSize.Height * 0.2;

            _ctx.font = gameDashboardSize.Height * 0.05 + "px Segoe UI";
            //  
            label2.X = gameDashboardPosition.X + (gameDashboardSize.Width * 0.15);
            label2.Y = gameDashboardSize.Height * 0.270;
            //Seus pontos
            label4.X = gameDashboardPosition.X + (gameDashboardSize.Width * 0.15);
            label4.Y = gameDashboardSize.Height * 0.115;

            this.btPlayAgainSize.Height = GetResolutionHeight(this.btPlayAgainImage.height);
            this.btPlayAgainSize.Width = GetResolutionWidth(this.btPlayAgainImage.width, this.btPlayAgainImage.height, this.btPlayAgainSize.Height);
            this.btPlayAgainPosition.X = (document.documentElement.offsetWidth / 2) - (this.btPlayAgainSize.Width / 2);
            this.btPlayAgainPosition.Y = document.documentElement.offsetHeight * 0.35;

            this.figShitDestroiedSize.Height = GetResolutionHeight(this.figShitDestroiedImage.height);
            this.figShitDestroiedSize.Width = GetResolutionWidth(this.figShitDestroiedImage.width, this.figShitDestroiedImage.height, this.figShitDestroiedSize.Height);
            this.figShitDestroiedPosition.X = (document.documentElement.offsetWidth / 2) - (this.figShitDestroiedSize.Width / 2);
            this.figShitDestroiedPosition.Y = document.documentElement.offsetHeight * 0.55;

            _ctx.restore();
        }

        this.show = function () {
            this.showScreen = true;
            newScreenOpacity = 1;
        }
        this.hide = function () {
            newScreenOpacity = 0;
            this.showScreen = false;
        }
    }

    /****************************** Objetos ********************************/
    function Shit() {
        var forceAltitude = 0;
        var forceLatitude = 0;
        var currentOrder; // Ordem de draw na tela
        //var isPositionAnimated = false;
        var latitudeAnimation = 0;
        var altitudeAnimation = 0;
        var rotationReaction = false;// controla a animação de reação do ovo, quando cai no ninho
        //var altitudeReaction = 0; // faz o ovo dar um pequeno pulinho quando chega no ninho
        var followCamera = false;
        var followCameraDifference = 0;
        var followCameraStopFollow = 0;
        var lastAltitude;


        this.ImgShit = new Image();
        this.Altitude;
        this.Latitude = 0;
        this.CurrentLandingPlace = null;
        this.IsJumping = false;
        this.Rotation = 0;
        this.RotationForce = 0;

        this.Position = new Vector2(0, 0);
        this.Size = new Size(50, 50);

        this.Jump = function (_altitudeSpeed) {
            if (!this.IsJumping) {
                forceAltitude = _altitudeSpeed;
                this.IsJumping = true;
                this.RotationForce = this.CurrentLandingPlace.Place.LatitudeForce * 0.008;

                soundBump.play();
            }
        }

        this.ChangePosition = function (_latitude, _altitude, _animated) {
            if (_animated) {
                latitudeAnimation = this.Latitude - _latitude;
                altitudeAnimation = this.Altitude - _altitude;
                this.Latitude = _latitude;
                this.Altitude = _altitude;


            } else {
                this.Latitude = _latitude;
                this.Altitude = _altitude;
                //isPositionAnimated = false;
            }
        }

        this.update = function () {

            this.Position.X = GetLatitude(this.Latitude);
            this.Position.Y = GetAltitudeY(this.Altitude);



            if (this.IsJumping) {

                var newForceAltitude = forceAltitude * deltaTime;

                this.Altitude += newForceAltitude;
                forceAltitude -= 200 * deltaTime;

                if (forceAltitude < 0) {
                    var sizeCenter = new Size(1, 1);
                    for (var i = 0; i < listLandingPlaces.length; i++) {

                        //Debug.writeln(newForceAltitude);

                        if (listLandingPlaces[i].Intersects(this.Position, this.Size) && // Se intersectar o ninho...
                            //this.Altitude > (listLandingPlaces[i].Place.Altitude -1) &&
                            newForceAltitude < -2.3 && // não deixa o ovo cair no ninho se ele tive muito baixo. Padrao -0.7.
                            (this.Altitude - newForceAltitude) > this.CurrentLandingPlace.Place.Altitude &&
                            listLandingPlaces[i].Place.Altitude > this.CurrentLandingPlace.Place.Altitude) // Não permite voltar ao mesmo ninho ou para os de baixo.
                        {
                            // Então pouso autorizado!

                            this.CurrentLandingPlace = listLandingPlaces[i];
                            this.IsJumping = false;

                            var latitudeDistance = this.Latitude - (listLandingPlaces[i].Place.Latitude + listLandingPlaces[i].CenterLatitude);
                            var _newRotationForce = latitudeDistance * 0.03;

                            this.RotationForce = _newRotationForce * -1;

                            listLandingPlaces[i].Place.Recieved();

                            this.ChangePosition(listLandingPlaces[i].Place.Latitude + listLandingPlaces[i].CenterLatitude, listLandingPlaces[i].Place.Altitude, true);
                            ChangeCameraPosition(listLandingPlaces[i].Place.Altitude - 26, true);
                            userPoints = Math.round(listLandingPlaces[i].Place.Altitude - firstAltitude);
                            rotationReaction = true;


                            nestLanding.play();

                        }
                    }
                }

                // codigo que espera o ovo de afastar do ovo, para aplicar o efeito de profundidade do nest/Shit
                if ((this.Altitude - this.CurrentLandingPlace.Place.Altitude) > 5 || forceAltitude < 1) {
                    currentOrder = 1;
                } else {
                    currentOrder = 0;
                }

            }

            if (!this.IsJumping) {

                if (isNaN(altitudeAnimation) || isNaN(latitudeAnimation)) {
                    altitudeAnimation = 0;
                    latitudeAnimation = 0;
                }

                this.Altitude = (this.CurrentLandingPlace.Place.Altitude + this.CurrentLandingPlace.CenterAltitude) + altitudeAnimation;
                this.Latitude = (this.CurrentLandingPlace.Place.Latitude + this.CurrentLandingPlace.CenterLatitude) + latitudeAnimation;
                latitudeAnimation *= 0.0150 / deltaTime; // 0.8
                altitudeAnimation *= 0.0150 / deltaTime; // 0.7;
                this.RotationForce *= 0.8;

                currentOrder = 0
            }

            var distanceCameraLandPosition = 26;

            if (//lastAltitude != this.Altitude &&
                this.Altitude >= (this.CurrentLandingPlace.Place.Altitude - 130) //&&
                //this.Altitude > this.CurrentLandingPlace.Place.Altitude &&
                //this.Altitude - distanceCameraLandPosition >= 0
                //this.Altitude < this.CurrentLandingPlace.Place.Altitude
                ) {
                ChangeCameraPosition(this.Altitude - distanceCameraLandPosition, true);

                if (!gameOverScreen.showScreen && this.CurrentLandingPlace.Place.Altitude - this.Altitude > 100) {
                    gameOverScreen.points = userPoints;


                    var applicationData = Windows.Storage.ApplicationData.current;

                    var recordScore;
                    recordScore = applicationData.localSettings.values["highScore"];

                    if (!recordScore) {
                        recordScore = 0;
                    }
                    else {
                        recordScore = parseInt(recordScore);

                    }

                    //if (isNaN(recordScore)) {
                    //    recordScore += 0;
                    //}

                    gameOverScreen.highestPoints = recordScore;

                    if (userPoints > recordScore) {
                        /*var state = {
                            //user: 'Lucas',
                            score: userPoints,
                            //date: new Date().toLocaleString()
                        };
                        WinJS.Application.local.writeText("recordedHighestPoints", JSON.stringify(state));//*/
                        applicationData.localSettings.values["highScore"] = userPoints;
                        gameOverScreen.highestPoints = userPoints;
                    }

                    gameOverScreen.show();

                    userPoints = 0;
                }
            }

            lastAltitude = this.Altitude

            this.Rotation += this.RotationForce;


        }

        this.draw = function (_ctx, _order) {
            if (currentOrder == _order && this.CurrentLandingPlace != null) {

                var _shitHalfWidth = this.Size.Width / 2;
                var _shitHalfHeight = this.Size.Height / 2;
                _ctx.save();;
                _ctx.translate(this.Position.X + _shitHalfWidth, this.Position.Y + _shitHalfHeight);
                _ctx.rotate(this.Rotation);
                _ctx.drawImage(this.ImgShit, -_shitHalfWidth, -_shitHalfHeight, this.Size.Width, this.Size.Height);
                _ctx.restore();

            }
        }
    }


    function Nest(_type, _altitude, _latitude, _altitudeSpeed, _latitudeSpeed, _firstDirection, _marginLeft, _marginRight, _marginTop, _marginBottom) {

        var marginLeft = 0;
        var marginRight = 0;
        var newAltitudeForce = 0;
        var newLatitudeForce = 0;
        var altitudeForce = 0;
        var latitudeForce = 0;
        var latitudeNestWidth = 29; // Número que é a largura do Nest em "Latitude"
        var isHolding = false;
        var realAltitude = _altitude;
        var plusAltitude = 0;
        var animationHit = 0;//Animação quando um ovo bate no ninho
        var animationHitAltitude = 0;
        var isAnimationHit = false;

        this.Position = new Vector2(0, 0);
        this.Size = new Size(100, 100);
        this.PositionCollision = new Vector2(0, 0);
        this.SizeCollision = new Size(100, 100);
        this.Type = _type;
        this.ImgNestFront = new Image();
        this.ImgNestBack = new Image();
        this.RelativePosition = new Vector2(0, 0);
        this.Altitude = _altitude;
        this.AltitudeStandard = this.Altitude; // Necessário para que a camera saiba onde deve focalizar
        this.Latitude = 0;
        this.IsMoving = true;
        this.LatitudeSpeed = 20; // É muito fácil confundir latitude de altitude, cuidado!
        this.AltitudeSpeed = 0;
        this.LatitudeForce = 0;
        this.CurrentDirection = _firstDirection;

        // Construtor
        //realSpeed = this.Speed;
        this.LatitudeSpeed = _latitudeSpeed;
        //latitudeForce = this.LatitudeSpeed;
        marginLeft = _latitudeSpeed / 5;
        marginRight = 90 - latitudeNestWidth;
        newLatitudeForce = _latitudeSpeed;

        latitudeForce = _latitudeSpeed * _firstDirection;

        if (_latitude < marginLeft)
            this.Latitude = marginLeft;
        else if (_latitude > marginRight)
            this.Latitude = marginRight;
        else
            this.Latitude = _latitude;

        this.Pull = function (_startAltitude, _currentAltitude) {

            if (!isHolding) {
                stretchSound.play();
                userHelp.reset();
            }

            isHolding = true;
            var newPlusAltitude = _currentAltitude - _startAltitude;

            if (newPlusAltitude < 0) {
                if (newPlusAltitude > -5)
                    plusAltitude = newPlusAltitude;
                else {
                    var plusAltitudeExc = newPlusAltitude + 5;
                    plusAltitude = -5 + (plusAltitudeExc * 0.1);
                }

            }
        }
        this.Release = function () {
            isHolding = false;
            if (shit.CurrentLandingPlace.Place == this) {
                if (plusAltitude < -5)
                    plusAltitude = -5;

                if (plusAltitude < -1) {
                    shit.Jump(plusAltitude * -30); //shit.Jump((plusAltitude -1) * 8.5);
                }
            }
        }
        this.Recieved = function () {
            isAnimationHit = true;
        }
        this.draw = function (_ctx, _order) {
            if (this.Altitude < CameraAltitudeReal + 25) {
                _ctx.save();



                var realAltitudeHitAnimationFront = 0;
                var realAltitudeHitAnimationBack = 0;

                var newFrontHeight = 0;

                if (isAnimationHit) {
                    realAltitudeHitAnimationFront = GetAltitudeY(this.Altitude - animationHitAltitude);
                    realAltitudeHitAnimationBack = GetAltitudeY(this.Altitude + animationHitAltitude);

                    newFrontHeight = (realAltitudeHitAnimationFront - this.Position.Y) * 0.5;
                }

                //_ctx.drawImage(this.ImgNestBack, this.Position.X, GetAltitudeY(this.Altitude), this.Size.Width, this.Size.Height);


                switch (_order) {
                    case 0:
                        if (!isAnimationHit)
                            _ctx.drawImage(this.ImgNestBack, this.Position.X, GetAltitudeY(this.Altitude), this.Size.Width, this.Size.Height);
                        else
                            _ctx.drawImage(this.ImgNestBack, this.Position.X, realAltitudeHitAnimationBack, this.Size.Width, this.Size.Height);

                        break;
                    case 1:
                        if (!isAnimationHit)
                            _ctx.drawImage(this.ImgNestFront, this.Position.X, GetAltitudeY(this.Altitude), this.Size.Width, this.Size.Height);
                        else
                            _ctx.drawImage(this.ImgNestFront, this.Position.X, realAltitudeHitAnimationFront, this.Size.Width, this.Size.Height - newFrontHeight);

                        // _ctx.drawImage(t, this.Position.X, realAltitudeHitAnimationBack, this.Size.Width, this.Size.Height);
                        break;
                }

                _ctx.restore();


                // código que imprime na tela qual é a area de coliso
                //_ctx.fillStyle = "black";
                //_ctx.fillRect(this.PositionCollision.X, this.PositionCollision.Y, this.SizeCollision.Width, this.SizeCollision.Height);
            }
        }

        this.update = function () {

            this.Altitude = realAltitude + plusAltitude;

            //position.Y =  // O mais 12 é para que a base de altitute do ninho seja bem abaixo dela


            if (plusAltitude != 0 && !isHolding) {
                plusAltitude *= 0.5;

            }


            if (this.IsMoving) {

                if (this.Latitude >= marginRight && newLatitudeForce > 0 ||
            this.Latitude <= marginLeft && newLatitudeForce < 0) {
                    newLatitudeForce *= -1;

                    if (newLatitudeForce < 0)
                        this.CurrentDirection = -1;
                    else
                        this.CurrentDirection = 1;

                }

                if (newLatitudeForce != latitudeForce) {
                    var distance = newLatitudeForce - latitudeForce;
                    distance *= 0.1;// (0.9 * deltaTime);
                    latitudeForce = latitudeForce + distance;
                }

                this.Latitude = this.Latitude + (latitudeForce * deltaTime);
                this.Position.X = GetLatitude(this.Latitude); //- GetLatitude(72); ;

                this.LatitudeForce = latitudeForce;

            }

            if (isAnimationHit) {
                animationHit += 12 * deltaTime;
                animationHitAltitude = Math.sin(animationHit);
                animationHitAltitude *= 0.5;

                if (animationHit >= Math.PI) {
                    isAnimationHit = false;
                    animationHitAltitude = 0;
                    animationHit = 0;
                }
            }

            var _x = this.Position.X + CameraSpecialPosition.X;
            var _y = GetAltitudeY(this.Altitude);// + CameraSpecialPosition.Y;
            this.Position = new Vector2(_x, _y);

            // código que mostra qual é a area de coliso
            this.PositionCollision = new Vector2(this.Position.X + (this.Size.Width * 0.32), this.Position.Y + (this.Size.Height * 0.2));
            this.SizeCollision = new Size(this.Size.Width * 0.35, this.Size.Height * 0.1);
        }

    }

    function DeepControl() {

        var heightInAltitude = 120;
        var altitude1 = 0;
        var altitude2 = heightInAltitude;

        this.RoofImage = new Image();
        this.RoofPosition = new Vector2(0, 0);
        this.RoofAltitute = 0;
        this.RoofSize = new Size(0, 0);

        this.resize = function () {
            //heightInAltitude = GetAltitudeByRealY(this.RoofImage.height);
        }

        this.update = function () {
            //this.RoofPosition.Y = (GetAltitudeY(this.RoofAltitute) - this.RoofSize.Height) + CameraSpecialPosition.Y;

            // Controle das imagens que vão para cima

            this.RoofPosition.X = ((document.documentElement.offsetWidth / 2) - (this.RoofSize.Width / 2)) + CameraSpecialPosition.X;

            if (altitude1 + heightInAltitude <= CameraAltitudeReal - 100) {
                altitude1 = altitude2 + heightInAltitude;
            } else if (altitude2 + heightInAltitude <= CameraAltitudeReal - 100) {
                altitude2 = altitude1 + heightInAltitude;

                // Controle das imagens que vão para baixo

            } else if (altitude1 > CameraAltitudeReal - 100 && altitude2 > CameraAltitudeReal - 100) {
                if (altitude1 < altitude2)
                    altitude2 = altitude1 - heightInAltitude;
                else
                    altitude1 = altitude2 - heightInAltitude;
            }

            //else if (altitude2 - heightInAltitude >= CameraAltitudeVirtual - 30) {
            //    altitude2 = altitude1 - heightInAltitude;
            //}

        };
        this.draw = function (_ctx) {
            _ctx.drawImage(this.RoofImage, this.RoofPosition.X, GetAltitudeY(altitude1 + heightInAltitude), this.RoofSize.Width, this.RoofSize.Height + 1);
            _ctx.drawImage(this.RoofImage, this.RoofPosition.X, GetAltitudeY(altitude2 + heightInAltitude), this.RoofSize.Width, this.RoofSize.Height + 1);
        };
    }

    function LandingPlace(_placeType, _altitude, _latitude, _altitudeSpeed, _latitudeSpeed, _firstDirection) {
        this.ID = 0;
        this.Place = null;

        this.ID = _placeType;
        this.CenterLatitude = 0; // Local de diferença exato onde o ovo vai pousar
        this.CenterAltitude = 0; // Local de diferença exato onde o ovo vai pousar
        this.IsToDelete = false;
        this.IsToLand = true;

        switch (_placeType) {
            case 1: // Ovo normal
                this.Place = new Nest(1, _altitude, _latitude, _altitudeSpeed, _latitudeSpeed, _firstDirection);
                this.CenterLatitude = 12;
                this.CenterAltitude = 1;
                break;
        }

        this.Intersects = function (_positon, _size) {
            var _landPosition = this.Place.PositionCollision;
            var _landSize = this.Place.SizeCollision;

            return CollisionDetect(_positon.X, _positon.Y, _size.Height, _size.Width,
                                        _landPosition.X, _landPosition.Y, _landSize.Height, _landSize.Width);
        }

        this.update = function () {

            this.Place.update();

            if (this.Place.Altitude < (CameraAltitudeReal - 100)) {
                this.IsToDelete = true;
            }


        }



        // por causa de bug, não foi possível adicionar os membros filhos.
        // Todo objeto Place tem que ter as seguintes propriedades e métodos: Size, Position, AltitudeForce, Draw, Update, PositionCollision, SizeCollision

    }

    function UserHelp() {
        this.ImgHand = new Image();
        this.NextTimeShow = 0;
        var nextAction = 0;
        var currentAction = 0;
        var opacity = 0;
        var isShowing = false;
        var newOpacity = 0;
        var currentAltitudeSlide = 0;

        var position = new Vector2(0, 0);
        var size = new Size(0, 0);

        this.draw = function (_ctx) {
            if (opacity > 0) {
                _ctx.save();
                _ctx.globalAlpha = opacity;

                _ctx.drawImage(this.ImgHand, shit.CurrentLandingPlace.Place.Position.X + (size.Width * 0.6), shit.CurrentLandingPlace.Place.Position.Y + (GetResolutionHeight(currentAltitudeSlide)), size.Width, size.Height);
                _ctx.restore();
            }

        }

        this.update = function () {
            if (currentScreen == 1) {
                if (this.NextTimeShow < currentGameTime && !isShowing) {
                    currentAction = 0;
                    this.NextTimeShow = currentGameTime + 15;
                    isShowing = true;
                    currentAltitudeSlide = 0;
                }
                if (newOpacity != opacity) {
                    var distance = newOpacity - opacity;
                    distance *= (deltaTime * 3);
                    opacity = opacity + distance;
                }
                if (isShowing) {
                    switch (currentAction) {
                        case 0:

                            newOpacity = 1;

                            if (opacity >= 0.8) {
                                currentAction = 1;
                            }

                            break;
                        case 1:

                            currentAltitudeSlide += 150 * deltaTime;

                            if (currentAltitudeSlide > 100) {
                                currentAction = 2;
                            }

                            break;
                        case 2:

                            newOpacity *= deltaTime;

                            if (newOpacity == 0) {
                                isShowing = false;
                                this.reset();
                            }

                            break;

                    }
                }
            }
        }

        this.resize = function () {
            size.Height = GetResolutionHeight(this.ImgHand.height);
            size.Width = GetResolutionWidth(this.ImgHand.width, this.ImgHand.height, size.Height);
        }

        this.reset = function () {
            this.NextTimeShow = currentGameTime + 10;
        }
    }

    /***************************** Architure *******************************/

    // Controle de FPS e DeltaTime
    var lastTime = 0;
    var fps = 0;
    var fpsStandard = 60;
    var fpsValue = 0;
    var deltaTime;

    function CollisionDetect(orignX, orignY, destinX, destinY) {
        return CollisionDetect(orignX, orignY, 1, 1, destinX, destinY, 1, 1)
    }

    function CollisionDetect(orignX, orignY, orignHeight, orignWidth,
                    destinX, destinY, destinHeight, destinWidth) {

        var left1 = orignX, left2 = destinX,
        right1 = orignX + orignWidth, right2 = destinX + destinWidth,
        top1 = orignY, top2 = destinY,
        bottom1 = orignY + orignHeight, bottom2 = destinY + destinHeight;

        if (bottom1 < top2) return (0);
        if (top1 > bottom2) return (0);

        if (right1 < left2) return (0);
        if (left1 > right2) return (0);

        return 1;


    }

    function Vector2(_x, _y) {
        /// <summary>Posição X e Y.</summary>
        this.X = _x;
        this.Y = _y;
    }

    function Size(_width, _height) {
        /// <summary>Posição X e Y.</summary>
        this.Width = _width;
        this.Height = _height;
    }

    function GetResolutionHeight(_height) {
        /// <summary>Retorna um valor de altura a partir de um valor padrao de altura. O 1000 é como se fosse a lente.</summary>
        return (_height / 1000) * document.documentElement.offsetHeight;
    }

    function GetResolutionWidth(_width, _oldHeight, _newHeight) {
        /// <summary>Retorna o valor de largura a partir do valor de altura. Ele mantem a resolução da imagem.</summary>
        return (_newHeight / _oldHeight) * _width;
    }


Game();