#!/bin/sh
# Create the DynamoDB tables used by test/ddb.
# Keys follow the entity field names so that kodo link expressions
# (e.g. Order.id -> Payment.orderid) map directly onto the partition keys.

# Order: HASH = id
aws dynamodb create-table \
    --table-name Order \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --table-class STANDARD

# Payment: HASH = orderid (query a payment by its order), RANGE = id
aws dynamodb create-table \
    --table-name Payment \
    --attribute-definitions \
        AttributeName=orderid,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=orderid,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --table-class STANDARD

# PaymentDetail: HASH = paymentid
aws dynamodb create-table \
    --table-name PaymentDetail \
    --attribute-definitions \
        AttributeName=paymentid,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=paymentid,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --table-class STANDARD

# OrderOwner: HASH = orderid (query an owner by its order)
aws dynamodb create-table \
    --table-name OrderOwner \
    --attribute-definitions \
        AttributeName=orderid,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=orderid,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --table-class STANDARD



# o1
aws dynamodb put-item \
  --table-name Order \
  --item '{"id":{"S":"o1"},"logid":{"S":"111"},"operator":{"NULL":true}}'

# o2
aws dynamodb put-item \
  --table-name Order \
  --item '{"id":{"S":"o2"},"logid":{"S":"shadow"},"operator":{"NULL":true}}'

# o3
aws dynamodb put-item \
  --table-name Order \
  --item '{"id":{"S":"o3"},"logid":{"S":"P12345"},"operator":{"S":"Shadow"}}'

# o4
aws dynamodb put-item \
  --table-name Order \
  --item '{"id":{"S":"o4"},"logid":{"S":"P12345"},"operator":{"S":"Allen"}}'

# p1-1
aws dynamodb put-item \
  --table-name Payment \
  --item '{"id":{"S":"p1-1"},"orderid":{"S":"o1"},"amount":{"N":"500"}}'

# p3-1
aws dynamodb put-item \
  --table-name Payment \
  --item '{"id":{"S":"p3-1"},"orderid":{"S":"o3"},"amount":{"N":"1300"}}'

# p3-2
aws dynamodb put-item \
  --table-name Payment \
  --item '{"id":{"S":"p3-2"},"orderid":{"S":"o3"},"amount":{"N":"2500"}}'

# p4-1
aws dynamodb put-item \
  --table-name Payment \
  --item '{"id":{"S":"p4-1"},"orderid":{"S":"o4"},"amount":{"N":"1100"}}'

# px-1
aws dynamodb put-item \
  --table-name Payment \
  --item '{"id":{"S":"px-1"},"orderid":{"S":"xxx"},"amount":{"N":"5600"}}'

# px-2
aws dynamodb put-item \
  --table-name Payment \
  --item '{"id":{"S":"px-2"},"orderid":{"S":"xxx"},"amount":{"N":"9000"}}'


aws dynamodb put-item \
  --table-name OrderOwner \
  --item '{"id":{"S":"oo3-1"},"orderid":{"S":"o3"},"name":{"S":"LPSV0001"}}'

# pd3-1
aws dynamodb put-item \
  --table-name PaymentDetail \
  --item '{"id":{"S":"pd3-1"},"paymentid":{"S":"p3-1"},"amount":{"N":"2400"},"desc":{"S":"shaodw - payment on 2023"}}'

# pd3-2
aws dynamodb put-item \
  --table-name PaymentDetail \
  --item '{"id":{"S":"pd3-2"},"paymentid":{"S":"p3-2"},"amount":{"N":"2800"},"desc":{"S":"shaodw - payment on 2024"}}'