export enum UserQueries {
  EXISTS_BY_MOBILE_NUMBER = `SELECT EXISTS(SELECT 1 FROM t_pledge_users WHERE mobile_number = $1) AS exists`,

  CREATE_USER = `INSERT INTO t_pledge_users (
  full_name,
  age, 
  mobile_number, 
  email_id, 
  gender, 
  state_id, 
  district_id, 
  pincode, 
  status, 
  date_created,
  date_updated
                 ) VALUES (
                   $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
                 ) RETURNING pledge_id`,
}
