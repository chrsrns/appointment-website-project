import { user_type, schedule_state, repeat } from '@prisma/client';
import { faker } from '@faker-js/faker';



export function fakeUser() {
  return {
    fname: faker.lorem.words(5),
    mname: faker.lorem.words(5),
    lname: faker.lorem.words(5),
    addr: faker.lorem.words(5),
    cnum: faker.lorem.words(5),
    emailaddr: faker.lorem.words(5),
    bdate: faker.datatype.datetime(),
    type: faker.helpers.arrayElement([user_type.Student, user_type.Teacher, user_type.Guidance, user_type.Clinic, user_type.Admin] as const),
    login_username: faker.lorem.words(5),
    login_password: faker.lorem.words(5),
  };
}
export function fakeUserComplete() {
  return {
    id: faker.datatype.uuid(),
    fname: faker.lorem.words(5),
    mname: faker.lorem.words(5),
    lname: faker.lorem.words(5),
    isOnline: false,
    addr: faker.lorem.words(5),
    cnum: faker.lorem.words(5),
    emailaddr: faker.lorem.words(5),
    bdate: faker.datatype.datetime(),
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: faker.helpers.arrayElement([user_type.Student, user_type.Teacher, user_type.Guidance, user_type.Clinic, user_type.Admin] as const),
    login_username: faker.lorem.words(5),
    login_password: faker.lorem.words(5),
  };
}
export function fakeRefreshToken() {
  return {
    hashedToken: faker.lorem.words(5),
  };
}
export function fakeRefreshTokenComplete() {
  return {
    id: faker.datatype.uuid(),
    hashedToken: faker.lorem.words(5),
    userId: faker.datatype.uuid(),
    revoked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
export function fakeSchedule() {
  return {
    fromDate: faker.datatype.datetime(),
    toDate: faker.datatype.datetime(),
    title: faker.lorem.words(5),
  };
}
export function fakeScheduleComplete() {
  return {
    id: faker.datatype.uuid(),
    state: schedule_state.Available,
    fromDate: faker.datatype.datetime(),
    toDate: faker.datatype.datetime(),
    title: faker.lorem.words(5),
    desc: '',
    repeat: repeat.None,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
export function fakeMessage() {
  return {
    content: faker.lorem.words(5),
  };
}
export function fakeMessageComplete() {
  return {
    id: faker.datatype.uuid(),
    createdAt: new Date(),
    content: faker.lorem.words(5),
    scheduleId: undefined,
  };
}
export function fakeAnnouncement() {
  return {
    content: faker.lorem.words(5),
  };
}
export function fakeAnnouncementComplete() {
  return {
    id: faker.datatype.uuid(),
    createdAt: new Date(),
    content: faker.lorem.words(5),
  };
}
export function fakeMedicalRecord() {
  return {
    content: faker.lorem.words(5),
  };
}
export function fakeMedicalRecordComplete() {
  return {
    id: faker.datatype.uuid(),
    content: faker.lorem.words(5),
    userId: faker.datatype.uuid(),
  };
}
