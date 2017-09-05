﻿import { Component, OnInit } from '@angular/core';

import { FabricAuthService } from '../shared/services/fabric-auth.service';
import { AuthService } from '../shared/services/auth.service';
import { Permission } from '../models/permission';
import { Role } from '../models/role';
import { Group } from '../models/group';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  groups: any[];
  permissions: string;
  groupJson: string;
  profile = {};  
  setupResult: string;

  constructor(private _fabricAuthService: FabricAuthService, private _authService: AuthService) {        
    this.permissions = '';
    this.groupJson = '';
    this.setupResult = '';
   }

  ngOnInit() {
    this._authService.getUser().then(result => {
      if (result) {
          this.profile = result.profile;          
      }
    });
  } 

  setupRolesAndPermissions(){
     var self = this; 
     let viewerPermission = new Permission("viewpatient", "app", "fabric-angularsample"); 
     let viewerRole = new Role('viewer', 'app', 'fabric-angularsample');
     let viewerGroup = new Group('FABRIC\\Health Catalyst Viewer', 'sample');
     let editorGroup = new Group('FABRIC\\Health Catalyst Editor', 'sample');

     this._fabricAuthService.createGroup(viewerPermission, viewerRole, viewerGroup)
       .then(() => {
          let editorPermission = new Permission("editpatient", "app", "fabric-angularsample"); 
          let editorRole = new Role('editor', 'app', 'fabric-angularsample');
           
          return self._fabricAuthService.createGroup(editorPermission, editorRole, editorGroup)
       });
  }

  viewPermissionsForUser(){
    var self = this;
    
    this._fabricAuthService.getPermissionsForUser()
    .then(permissions => {
      self.permissions = JSON.stringify(permissions,null, 2);
    });
  }

  viewCreatedGroupsRolesAndPermissions(){
    var self = this;
    var groups = [];
    let viewerGroup = 'FABRIC\\Health Catalyst Viewer';
    let editorGroup = 'FABRIC\\Health Catalyst Editor';
    //TODO: move this to observable pattern (fire requests async)
    self._fabricAuthService.get(`groups/${encodeURIComponent(viewerGroup)}/roles`)
      .then(group => {
        
        groups.push(group);
    }).then(()=>
        self._fabricAuthService.get(`groups/${encodeURIComponent(editorGroup)}/roles`)
        .then(group =>{ 
      
        groups.push(group);
        self.groupJson = JSON.stringify(groups, null, 2);
    }));
    
  }
 
}
