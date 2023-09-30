const { user_type, schedule_state, repeat } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

function fakeStudentUser() {
  return {
    fname: faker.name.firstName(),
    mname: faker.name.middleName(),
    lname: faker.name.lastName(),
    addr: faker.address.city(),
    cnum: faker.phone.number(),
    emailaddr: faker.internet.email(),
    bdate: faker.date.birthdate(),
    rating: 0,
    updatedAt: faker.datatype.datetime(),
    type: faker.helpers.arrayElement([user_type.Student]),
    login_username: faker.internet.userName(),
    login_password: bcrypt.hashSync("test123", 12),
  };
}
function fakeStaffUser() {
  return {
    fname: faker.name.firstName(),
    mname: faker.name.middleName(),
    lname: faker.name.lastName(),
    addr: faker.address.city(),
    cnum: faker.phone.number(),
    emailaddr: faker.internet.email(),
    bdate: faker.date.birthdate(),
    rating: 0,
    updatedAt: faker.datatype.datetime(),
    type: faker.helpers.arrayElement([
      user_type.Teacher,
      user_type.Guidance,
      user_type.Clinic,
      user_type.Admin,
    ]),
    login_username: faker.internet.userName(),
    login_password: bcrypt.hashSync("test123", 12),
  };
}
function fakeUserComplete() {
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
    rating: faker.datatype.number(),
    createdAt: new Date(),
    updatedAt: new Date(),
    type: faker.helpers.arrayElement([
      user_type.Student,
      user_type.Teacher,
      user_type.Guidance,
      user_type.Clinic,
      user_type.Admin,
    ]),
    login_username: faker.lorem.words(5),
    login_password: faker.lorem.words(5),
  };
}

module.exports = {
  fakeStaffUser,
  fakeStudentUser,
  fakeUserComplete,
};
// export function fakeRefreshToken() {
//   return {
//     hashedToken: faker.lorem.words(5),
//   };
// }
// export function fakeRefreshTokenComplete() {
//   return {
//     id: faker.datatype.uuid(),
//     hashedToken: faker.lorem.words(5),
//     userId: faker.datatype.uuid(),
//     revoked: false,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };
// }
// export function fakeSchedule() {
//   return {
//     fromDate: faker.datatype.datetime(),
//     toDate: faker.datatype.datetime(),
//     title: faker.lorem.words(5),
//   };
// }
// export function fakeScheduleComplete() {
//   return {
//     id: faker.datatype.uuid(),
//     state: schedule_state.Available,
//     fromDate: faker.datatype.datetime(),
//     toDate: faker.datatype.datetime(),
//     title: faker.lorem.words(5),
//     desc: '',
//     repeat: repeat.None,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };
// }
// export function fakeMessage() {
//   return {
//     content: faker.lorem.words(5),
//   };
// }
// export function fakeMessageComplete() {
//   return {
//     id: faker.datatype.uuid(),
//     createdAt: new Date(),
//     content: faker.lorem.words(5),
//     scheduleId: undefined,
//   };
// }
// export function fakeAnnouncement() {
//   return {
//     content: faker.lorem.words(5),
//   };
// }
// export function fakeAnnouncementComplete() {
//   return {
//     id: faker.datatype.uuid(),
//     createdAt: new Date(),
//     content: faker.lorem.words(5),
//   };
// }
// export function fakeMedicalRecord() {
//   return {
//     content: faker.lorem.words(5),
//   };
// }
// export function fakeMedicalRecordComplete() {
//   return {
//     id: faker.datatype.uuid(),
//     content: faker.lorem.words(5),
//     userId: faker.datatype.uuid(),
//   };
// }
