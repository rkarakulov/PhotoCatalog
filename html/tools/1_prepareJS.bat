cd "..\js\"

del "all.prepare.js"

del "all.annotated.js"

type utils.js >> "all.prepare.js"

cd "common\"

type Uploader.js >> "../all.prepare.js"

cd "..\directives\"

type ngCookies.js >> "../all.prepare.js"

cd "..\services\"

type baseService.js importService.js cardsService.js shippingsService.js terbanksService.js usersService.js authService.js paginationService.js services.js >> "../all.prepare.js"

cd "..\models\"

type onlineRegisterContext.js >> "../all.prepare.js"

cd "..\"

type app.js >> "all.prepare.js"

cd "controllers\"

type importController.js cardsSearchController.js cardsReportController.js shippingsController.js terbanksController.js usersController.js authController.js menuController.js >> "../all.prepare.js"
                         
cd "..\..\js\"

ngmin all.prepare.js all.annotated.js



