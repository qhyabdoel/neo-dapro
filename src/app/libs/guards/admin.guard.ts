import { Injectable } from "@angular/core";
import {
    CanActivate,
    Router,
} from "@angular/router";
import { environment } from "src/environments/environment";
import { JsonService } from 'src/app/libs/services';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private router: Router,
        private jsonService: JsonService
    ) {console.log("gaga")}

    canActivate(): Promise<boolean> {
        return this.jsonService.retEnvironment(environment.type)
            .then((env) => {
                const user = JSON.parse(localStorage.getItem("user"));
                if (env.user_management && Object.keys(user.scopes).indexOf("administration") >= 0) {
                    return true;
                }
                this.router.navigateByUrl('/');
            }).catch((error) => {
                console.log("Promise rejected with " + JSON.stringify(error));
                return false;
            });
    }
}
