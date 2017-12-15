import { Auth1Service } from './../../services/auth1.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { PasswordValidator } from '../password-validator';
import { Router } from '@angular/router';
import { HttpHeaderResponse } from '@angular/common/http/src/response';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

interface User {
  pk: number;
  user_type: string;
  email: string;
  nickname: string;
  is_active: string;
  date_joined: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userForm: FormGroup;
  regexr = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  appUrl = environment.apiUrl;
  Email: string;
  Nickname: string;

  constructor(
    private fb: FormBuilder,
    private auth: Auth1Service,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      userEmail: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern(this.regexr)
      ]],
      passwordGroup: this.fb.group({
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      }, { validator: PasswordValidator.match })
    });
    this.getProfile();
  }

  get userName() {
    return this.userForm.get('userName');
  }
  get passwordGroup() {
    return this.userForm.get('passwordGroup');
  }
  get password() {
    return this.userForm.get('passwordGroup.password');
  }
  get confirmPassword() {
    return this.userForm.get('passwordGroup.confirmPassword');
  }

  getProfile() {
    this.http.get<User>(`${this.appUrl}/profile/${this.auth.getUserPk()}/`, { observe: 'response' })
      .subscribe(res => {
        console.log(res);
        this.Email = res.body.email;
        this.Nickname = res.body.nickname;
      console.log('회원정보 불러오기 성공!');
      // 이렇게 하는게 맞는걸까?
      this.setForm();
    });
  }

  editProfile() {
    const editProfileForm = {
      nickname: this.userName.value,
      password1: this.password.value,
      password2: this.confirmPassword.value
    };
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Token ${this.auth.getToken()}`);
    console.log(`[payload] ${editProfileForm}`);
    this.http.patch(`${this.appUrl}/profile/${this.auth.getUserPk()}/`, editProfileForm, { headers: headers })
      .subscribe(res => {
        console.log(res);
        console.log('회원정보 수정 성공!');
        this.router.navigate(['profile']);
      });
  }

  setForm() {
    console.log(this.Email);
    this.userForm.patchValue({
      userName: this.Nickname,
      userEmail: this.Email
    });
  }

  logout() {
    this.auth.removeTokenAndPk();
    console.log('로그아웃 완료!');
    this.router.navigate(['signin']);
  }
}
