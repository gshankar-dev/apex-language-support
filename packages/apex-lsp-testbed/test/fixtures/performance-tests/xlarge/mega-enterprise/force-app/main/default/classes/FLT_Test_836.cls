@isTest
private class FLT_Test_836 {

    private class MockProcessor extends FLT_BaseService_825.RecordProcessor {
        private List<Id> processedIds;

        public MockProcessor(FLT_BaseService_825.ServiceConfig config) {
            super(config);
            this.processedIds = new List<Id>();
        }

        protected override Boolean shouldProcess(EmailMessage record) {
            return record.Id != null;
        }

        protected override EmailMessage processRecord(EmailMessage record, Map<Id, EmailMessage> allRecords) {
            this.processedIds.add(record.Id);
            return record;
        }
    }

    @TestSetup
    static void setupTestData() {
        List<EmailMessage> records = new List<EmailMessage>();
        for (Integer i = 0; i < 50; i++) {
            records.add(new EmailMessage(
                Name = 'Test Record ' + String.valueOf(i).leftPad(4, '0')
            ));
        }
        insert records;
    }

    @isTest
    static void testServiceExecution() {
        List<EmailMessage> records = [SELECT Id, Name FROM EmailMessage LIMIT 10];
        FLT_BaseService_825.ServiceConfig config = new FLT_BaseService_825.ServiceConfig()
            .withCaching(true)
            .withBatchSize(100)
            .withOption('mode', 'test')
            .excludeField('OwnerId');

        Test.startTest();
        FLT_RecordService_825 service = new FLT_RecordService_825();
        FLT_BaseService_825.ServiceResult result = service.execute(records, config);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.success, 'Execution should succeed: ' + String.join(result.errors, ', '));
    }

    @isTest
    static void testServiceWithErrors() {
        FLT_BaseService_825.ServiceConfig config = new FLT_BaseService_825.ServiceConfig();
        FLT_BaseService_825.ServiceResult result = new FLT_BaseService_825.ServiceResult();
        result.addError('Test error');
        result.addFieldError('Name', null, 'Invalid name');

        System.assertEquals(false, result.success, 'Should be failed');
        System.assertEquals(1, result.errors.size(), 'Should have one error');
        System.assert(result.fieldErrors.containsKey('Name'), 'Should have field error');
    }

    @isTest
    static void testMockProcessor() {
        List<EmailMessage> records = [SELECT Id, Name FROM EmailMessage LIMIT 5];
        FLT_BaseService_825.ServiceConfig config = new FLT_BaseService_825.ServiceConfig()
            .withBatchSize(50);

        MockProcessor processor = new MockProcessor(config);

        Test.startTest();
        FLT_BaseService_825.ServiceResult result = processor.process(records);
        Test.stopTest();

        System.assertEquals(records.size(), processor.processedIds.size(), 'All records should be processed');
        System.assertEquals(records.size(), result.recordsProcessed, 'Count should match');
    }

    @isTest
    static void testConfigBuilder() {
        FLT_BaseService_825.ServiceConfig config = new FLT_BaseService_825.ServiceConfig()
            .withCaching(false)
            .withBatchSize(50)
            .withOption('key1', 'value1')
            .withOption('key2', 'value2')
            .excludeField('Field1')
            .excludeField('Field2');

        System.assertEquals(false, config.enableCaching, 'Caching should be disabled');
        System.assertEquals(50, config.batchSize, 'Batch size should be 50');
        System.assertEquals(2, config.options.size(), 'Should have 2 options');
        System.assertEquals(2, config.excludedFields.size(), 'Should have 2 excluded fields');
    }

    @isTest
    static void testServiceResultChaining() {
        FLT_BaseService_825.ServiceResult result = new FLT_BaseService_825.ServiceResult();
        EmailMessage testRecord = [SELECT Id FROM EmailMessage LIMIT 1];

        result.recordProcessed(testRecord.Id, testRecord)
            .addFieldError('Status', testRecord.Id, 'Invalid status')
            .addFieldError('Status', testRecord.Id, 'Another error')
            .addError('General error');

        System.assertEquals(false, result.success);
        System.assertEquals(1, result.errors.size());
        System.assertEquals(1, result.processedRecords.size());
        System.assert(result.fieldErrors.containsKey('Status'));
        System.assertEquals(2, result.fieldErrors.get('Status').get(testRecord.Id).size());
    }
}
