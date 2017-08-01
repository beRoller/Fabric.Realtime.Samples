import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { Permission } from '../../models/permission';
import { Role } from '../../models/role';

@Injectable()
export class FabricAuthService{
    private _uriBase: string = "http://localhost:5004";
    
    constructor(private _http: Http, private _authService: AuthService) { }

    createGroup(permission: Permission, role: Role, group: string){        
        var self = this;
        //create permission
        return this.createPermission(permission)            
            .then(function(permission){                    
                //create role
                return self.createRole(role)           
            .then(function(newRole){
                let localRole = newRole;
                //add permission to role
                return self.addPermissionToRole(permission, localRole)            
            .then(function(){
                //add role to group
                return self.addRoleToGroup(localRole, group);
        });});});
    }

    getPermissionsForUser(): Promise<UserPermissions> {
         return this.get(`user/permissions`);
    }

    private createPermission(permission: Permission) : Promise<Permission> {       
        let resource = 'permissions';
        return this.post<Permission>(permission, resource);      
    }

    private createRole(role: Role) : Promise<Role>{
        let resource = 'roles';
        return this.post<Role>(role, resource);
    }

    private addPermissionToRole(permission: Permission, role: Role){
        let resource = `roles/${role.id}/permissions`;
        return this.post([permission], resource);
    }

    private addRoleToGroup(role: Role, group: string){       
        let encodedGroup = encodeURIComponent(group);
        let resource = `groups/${encodedGroup}/roles`;
        return this.post(role, resource);
    }

    get<T>(resource: string) : Promise<T>{
        return this.getAccessToken()
        .then((token)=>{
            let headers = new Headers({ 'Authorization': 'Bearer ' + token });
            let options = new RequestOptions({ headers: headers });
            return this._http.get(this._uriBase +'/' + resource, options)
                .map((res: Response) => {
                return res.json();
                })
                .catch(this.handleError)
                .toPromise<T>()
        });        
    }    

    post<T>(data: any, resource: string ) : Promise<T>{
        return this.getAccessToken()
        .then(token => {
            let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
            let options = new RequestOptions({ headers: headers });
            return this._http.post(this._uriBase +'/' + resource, data, options)
                .map((res: Response) => { return res.json()} )
                .catch(this.handleError)
                .toPromise<T>(); 
            });        
    }

    getObservable(resource: string){
        return this.getAccessToken()
        .then((token)=>{
            let headers = new Headers({ 'Authorization': 'Bearer ' + token });
            let options = new RequestOptions({ headers: headers });
            return this._http.get(resource, options);
        });    
    }

    private getAccessToken() : Promise<string>{
         let self = this;
         return this._authService.getUser()
            .then(function(user){           
            if(user){
                 return Promise.resolve(user.access_token);
                }
            });
    }

    private handleError (error: Response | any) {
	    console.error(error.message || error);
	    return Observable.throw(error.message || error);
    }
}
interface UserPermissions{
    permissions: string[],
    requestedGrain: string,
    requestedSecurableItem: string
}
