@isTest
private class INV_Test_865 {

    private class MockProcessor extends INV_BaseService_854.RecordProcessor {
        private List<Id> processedIds;

        public MockProcessor(INV_BaseService_854.ServiceConfig config) {
            super(config);
            this.processedIds = new List<Id>();
        }

        protected override Boolean shouldProcess(Account record) {
            return record.Id != null;
        }

        protected override Account processRecord(Account record, Map<Id, Account> allRecords) {
            this.processedIds.add(record.Id);
            return record;
        }
    }

    @TestSetup
    static void setupTestData() {
        List<Account> records = new List<Account>();
        for (Integer i = 0; i < 50; i++) {
            records.add(new Account(
                Name = 'Test Record ' + String.valueOf(i).leftPad(4, '0')
            ));
        }
        insert records;
    }

    @isTest
    static void testServiceExecution() {
        List<Account> records = [SELECT Id, Name FROM Account LIMIT 10];
        INV_BaseService_854.ServiceConfig config = new INV_BaseService_854.ServiceConfig()
            .withCaching(true)
            .withBatchSize(100)
            .withOption('mode', 'test')
            .excludeField('OwnerId');

        Test.startTest();
        INV_RecordService_854 service = new INV_RecordService_854();
        INV_BaseService_854.ServiceResult result = service.execute(records, config);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.success, 'Execution should succeed: ' + String.join(result.errors, ', '));
    }

    @isTest
    static void testServiceWithErrors() {
        INV_BaseService_854.ServiceConfig config = new INV_BaseService_854.ServiceConfig();
        INV_BaseService_854.ServiceResult result = new INV_BaseService_854.ServiceResult();
        result.addError('Test error');
        result.addFieldError('Name', null, 'Invalid name');

        System.assertEquals(false, result.success, 'Should be failed');
        System.assertEquals(1, result.errors.size(), 'Should have one error');
        System.assert(result.fieldErrors.containsKey('Name'), 'Should have field error');
    }

    @isTest
    static void testMockProcessor() {
        List<Account> records = [SELECT Id, Name FROM Account LIMIT 5];
        INV_BaseService_854.ServiceConfig config = new INV_BaseService_854.ServiceConfig()
            .withBatchSize(50);

        MockProcessor processor = new MockProcessor(config);

        Test.startTest();
        INV_BaseService_854.ServiceResult result = processor.process(records);
        Test.stopTest();

        System.assertEquals(records.size(), processor.processedIds.size(), 'All records should be processed');
        System.assertEquals(records.size(), result.recordsProcessed, 'Count should match');
    }

    @isTest
    static void testConfigBuilder() {
        INV_BaseService_854.ServiceConfig config = new INV_BaseService_854.ServiceConfig()
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
        INV_BaseService_854.ServiceResult result = new INV_BaseService_854.ServiceResult();
        Account testRecord = [SELECT Id FROM Account LIMIT 1];

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
