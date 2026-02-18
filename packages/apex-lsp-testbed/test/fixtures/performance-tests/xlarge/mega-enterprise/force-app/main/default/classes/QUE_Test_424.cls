@isTest
private class QUE_Test_424 {

    private class MockProcessor extends QUE_BaseService_413.RecordProcessor {
        private List<Id> processedIds;

        public MockProcessor(QUE_BaseService_413.ServiceConfig config) {
            super(config);
            this.processedIds = new List<Id>();
        }

        protected override Boolean shouldProcess(User record) {
            return record.Id != null;
        }

        protected override User processRecord(User record, Map<Id, User> allRecords) {
            this.processedIds.add(record.Id);
            return record;
        }
    }

    @TestSetup
    static void setupTestData() {
        List<User> records = new List<User>();
        for (Integer i = 0; i < 50; i++) {
            records.add(new User(
                Name = 'Test Record ' + String.valueOf(i).leftPad(4, '0')
            ));
        }
        insert records;
    }

    @isTest
    static void testServiceExecution() {
        List<User> records = [SELECT Id, Name FROM User LIMIT 10];
        QUE_BaseService_413.ServiceConfig config = new QUE_BaseService_413.ServiceConfig()
            .withCaching(true)
            .withBatchSize(100)
            .withOption('mode', 'test')
            .excludeField('OwnerId');

        Test.startTest();
        QUE_RecordService_413 service = new QUE_RecordService_413();
        QUE_BaseService_413.ServiceResult result = service.execute(records, config);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.success, 'Execution should succeed: ' + String.join(result.errors, ', '));
    }

    @isTest
    static void testServiceWithErrors() {
        QUE_BaseService_413.ServiceConfig config = new QUE_BaseService_413.ServiceConfig();
        QUE_BaseService_413.ServiceResult result = new QUE_BaseService_413.ServiceResult();
        result.addError('Test error');
        result.addFieldError('Name', null, 'Invalid name');

        System.assertEquals(false, result.success, 'Should be failed');
        System.assertEquals(1, result.errors.size(), 'Should have one error');
        System.assert(result.fieldErrors.containsKey('Name'), 'Should have field error');
    }

    @isTest
    static void testMockProcessor() {
        List<User> records = [SELECT Id, Name FROM User LIMIT 5];
        QUE_BaseService_413.ServiceConfig config = new QUE_BaseService_413.ServiceConfig()
            .withBatchSize(50);

        MockProcessor processor = new MockProcessor(config);

        Test.startTest();
        QUE_BaseService_413.ServiceResult result = processor.process(records);
        Test.stopTest();

        System.assertEquals(records.size(), processor.processedIds.size(), 'All records should be processed');
        System.assertEquals(records.size(), result.recordsProcessed, 'Count should match');
    }

    @isTest
    static void testConfigBuilder() {
        QUE_BaseService_413.ServiceConfig config = new QUE_BaseService_413.ServiceConfig()
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
        QUE_BaseService_413.ServiceResult result = new QUE_BaseService_413.ServiceResult();
        User testRecord = [SELECT Id FROM User LIMIT 1];

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
