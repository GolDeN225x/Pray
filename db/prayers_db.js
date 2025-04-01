// Database initialization for the Prayer Tracking App

// Initialize database connection
async function connectToDatabase() {
    try {
        // في بيئة الإنتاج، استخدم مكتبة مناسبة للاتصال بقاعدة البيانات
        // مثل mysql2 أو pg أو mongodb
        console.log('تم الاتصال بقاعدة البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', error);
        return false;
    }
}

// Initialize database if not exists
async function initDatabase() {
    try {
        // الاتصال بقاعدة البيانات
        const connected = await connectToDatabase();
        
        if (!connected) {
            console.error('فشل الاتصال بقاعدة البيانات');
            // استخدام التخزين المحلي كبديل مؤقت
            initLocalStorage();
            return;
        }
        
        // إنشاء الجداول إذا لم تكن موجودة
        await createTablesIfNotExist();
        
        // إدخال البيانات الافتراضية إذا لم تكن موجودة
        await insertDefaultData();
        
        console.log('تم تهيئة قاعدة البيانات بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة قاعدة البيانات:', error);
        // استخدام التخزين المحلي كبديل مؤقت
        initLocalStorage();
    }
}

// Create tables if not exist
async function createTablesIfNotExist() {
    try {
        // إنشاء جدول المستخدمين
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                registration_date DATETIME NOT NULL,
                last_login DATETIME
            )
        `;
        await executeQuery(createUsersTable);
        
        // إنشاء جدول الصلوات
        const createPrayersTable = `
            CREATE TABLE IF NOT EXISTS prayers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                prayer_name VARCHAR(50) NOT NULL,
                prayer_date DATE NOT NULL,
                prayer_time TIME NOT NULL,
                status VARCHAR(20) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await executeQuery(createPrayersTable);
        
        // إنشاء جدول أنواع الأذكار
        const createAdhkarTypesTable = `
            CREATE TABLE IF NOT EXISTS adhkar_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(50) NOT NULL,
                arabic TEXT NOT NULL,
                translation TEXT,
                count INT DEFAULT 1
            )
        `;
        await executeQuery(createAdhkarTypesTable);
        
        // إنشاء جدول الأذكار المسجلة
        const createAdhkarTable = `
            CREATE TABLE IF NOT EXISTS adhkar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                adhkar_id INT NOT NULL,
                adhkar_type VARCHAR(50) NOT NULL,
                adhkar_date DATE NOT NULL,
                adhkar_time TIME NOT NULL,
                count INT DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (adhkar_id) REFERENCES adhkar_types(id) ON DELETE CASCADE
            )
        `;
        await executeQuery(createAdhkarTable);
        
        // إنشاء جدول أوقات الصلاة
        const createPrayerTimesTable = `
            CREATE TABLE IF NOT EXISTS prayer_times (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                fajr TIME NOT NULL,
                dhuhr TIME NOT NULL,
                asr TIME NOT NULL,
                maghrib TIME NOT NULL,
                isha TIME NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await executeQuery(createPrayerTimesTable);
        
        // إنشاء جدول الأهداف
        const createGoalsTable = `
            CREATE TABLE IF NOT EXISTS goals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                goal_type VARCHAR(50) NOT NULL,
                goal_value INT NOT NULL,
                goal_period VARCHAR(20) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await executeQuery(createGoalsTable);
        
        // إنشاء جدول الحكمة اليومية
        const createDailyWisdomTable = `
            CREATE TABLE IF NOT EXISTS daily_wisdom (
                id INT AUTO_INCREMENT PRIMARY KEY,
                text TEXT NOT NULL,
                source VARCHAR(100)
            )
        `;
        await executeQuery(createDailyWisdomTable);
        
        console.log('تم إنشاء الجداول بنجاح');
    } catch (error) {
        console.error('خطأ في إنشاء الجداول:', error);
        throw error;
    }
}

// Insert default data if not exist
async function insertDefaultData() {
    try {
        // التحقق من وجود بيانات في جدول أنواع الأذكار
        const adhkarTypesCount = await getCount('adhkar_types');
        
        if (adhkarTypesCount === 0) {
            // إدخال بيانات الأذكار الافتراضية
            await insertDefaultAdhkar();
        }
        
        // التحقق من وجود بيانات في جدول الحكمة اليومية
        const wisdomCount = await getCount('daily_wisdom');
        
        if (wisdomCount === 0) {
            // إدخال بيانات الحكمة اليومية الافتراضية
            await insertDefaultWisdom();
        }
        
        console.log('تم إدخال البيانات الافتراضية بنجاح');
    } catch (error) {
        console.error('خطأ في إدخال البيانات الافتراضية:', error);
        throw error;
    }
}

// Insert default adhkar
async function insertDefaultAdhkar() {
    try {
        // بيانات الأذكار الافتراضية
        const defaultAdhkar = {
            morning: [
                {
                    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
                    translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.',
                    count: 1
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
                    translation: 'O Allah, I ask You for knowledge that is beneficial, provision that is good, and deeds that are acceptable.',
                    count: 1
                },
                {
                    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
                    translation: 'Glory and praise is to Allah, as many times as the number of His creation, as much as pleases Him, as much as the weight of His Throne, and as much as the ink of His words.',
                    count: 3
                }
            ],
            evening: [
                {
                    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
                    translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.',
                    count: 1
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ، وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ',
                    translation: 'O Allah, I seek refuge in You from the evil of what I have done and from the evil of what I have not done.',
                    count: 1
                }
            ],
            after_prayer: [
                {
                    arabic: 'أَسْتَغْفِرُ اللَّهَ (ثَلاثًا) اللَّهُمَّ أَنْتَ السَّلامُ، وَمِنْكَ السَّلامُ، تَبَارَكْتَ يَا ذَا الْجَلالِ وَالإِكْرَامِ',
                    translation: 'I ask Allah for forgiveness (three times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
                    count: 1
                },
                {
                    arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
                    translation: 'None has the right to be worshipped except Allah, alone, without any partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
                    count: 1
                }
            ],
            sleep: [
                {
                    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
                    translation: 'In Your name, O Allah, I die and I live.',
                    count: 1
                },
                {
                    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
                    translation: 'O Allah, protect me from Your punishment on the day when You resurrect Your servants.',
                    count: 1
                }
            ],
            general: [
                {
                    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
                    translation: 'Glory and praise is to Allah. Glory is to Allah, the Magnificent.',
                    count: 10
                },
                {
                    arabic: 'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
                    translation: 'There is no might nor power except with Allah.',
                    count: 10
                }
            ]
        };
        
        // إدخال الأذكار لكل فئة
        for (const category in defaultAdhkar) {
            const adhkarList = defaultAdhkar[category];
            
            for (const dhikr of adhkarList) {
                const query = `
                    INSERT INTO adhkar_types (category, arabic, translation, count)
                    VALUES (?, ?, ?, ?)
                `;
                await executeQuery(query, [category, dhikr.arabic, dhikr.translation, dhikr.count]);
            }
        }
        
        console.log('تم إدخال الأذكار الافتراضية بنجاح');
    } catch (error) {
        console.error('خطأ في إدخال الأذكار الافتراضية:', error);
        throw error;
    }
}

// Insert default wisdom
async function insertDefaultWisdom() {
    try {
        // بيانات الحكمة اليومية الافتراضية
        const wisdomData = [
            {
                text: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا',
                source: 'سورة النساء: 103'
            },
            {
                text: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ',
                source: 'سورة البقرة: 238'
            },
            {
                text: 'وَأَقِمِ الصَّلَاةَ طَرَفَيِ النَّهَارِ وَزُلَفًا مِّنَ اللَّيْلِ إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ',
                source: 'سورة هود: 114'
            }
        ];
        
        // إدخال بيانات الحكمة اليومية
        for (const wisdom of wisdomData) {
            const query = `
                INSERT INTO daily_wisdom (text, source)
                VALUES (?, ?)
            `;
            await executeQuery(query, [wisdom.text, wisdom.source]);
        }
        
        console.log('تم إدخال بيانات الحكمة اليومية بنجاح');
    } catch (error) {
        console.error('خطأ في إدخال بيانات الحكمة اليومية:', error);
        throw error;
    }
}

// Get count of records in a table
async function getCount(tableName) {
    try {
        const query = `SELECT COUNT(*) as count FROM ${tableName}`;
        const result = await executeQuery(query);
        
        return result[0].count;
    } catch (error) {
        console.error(`خطأ في الحصول على عدد السجلات في جدول ${tableName}:`, error);
        return 0;
    }
}

// Execute query
async function executeQuery(query, params = []) {
    try {
        // في بيئة الإنتاج، استخدم الاتصال الفعلي لتنفيذ الاستعلام
        console.log('تنفيذ استعلام:', query, params);
        
        // محاكاة استجابة من قاعدة البيانات
        // في الإنتاج، استبدل هذا بالاستعلام الفعلي
        return simulateQueryResponse(query, params);
    } catch (error) {
        console.error('خطأ في تنفيذ الاستعلام:', error);
        throw error;
    }
}

// Simulate query response (للتطوير فقط)
function simulateQueryResponse(query, params) {
    // تحقق من نوع الاستعلام
    if (query.toLowerCase().includes('select')) {
        // محاكاة استعلام SELECT
        if (query.includes('users')) {
            return simulateUsersQuery(query, params);
        } else if (query.includes('prayers')) {
            return simulatePrayersQuery(query, params);
        } else if (query.includes('adhkar')) {
            return simulateAdhkarQuery(query, params);
        } else if (query.includes('daily_wisdom')) {
            return simulateWisdomQuery(query, params);
        } else if (query.includes('count')) {
            return [{ count: 0 }];
        }
    } else if (query.toLowerCase().includes('insert')) {
        // محاكاة استعلام INSERT
        return { insertId: Math.floor(Math.random() * 1000) + 1 };
    } else if (query.toLowerCase().includes('update')) {
        // محاكاة استعلام UPDATE
        return { affectedRows: 1 };
    } else if (query.toLowerCase().includes('delete')) {
        // محاكاة استعلام DELETE
        return { affectedRows: 1 };
    } else if (query.toLowerCase().includes('create table')) {
        // محاكاة استعلام CREATE TABLE
        return { success: true };
    }
    
    // استجابة افتراضية
    return [];
}

// محاكاة استعلامات المستخدمين
function simulateUsersQuery(query, params) {
    // استرجاع بيانات المستخدمين من التخزين المحلي للمحاكاة
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // إذا كان الاستعلام يتضمن معرف مستخدم محدد
    if (params.length > 0 && query.includes('WHERE')) {
        if (query.includes('username') && query.includes('password')) {
            // محاكاة استعلام تسجيل الدخول
            const username = params[0];
            const password = params[1];
            return users.filter(user => user.username === username && user.password === password);
        } else if (query.includes('id')) {
            // محاكاة استعلام بواسطة المعرف
            const userId = parseInt(params[0]);
            return users.filter(user => user.id === userId);
        }
    }
    
    return users;
}

// محاكاة استعلامات الصلوات
function simulatePrayersQuery(query, params) {
    // استرجاع بيانات الصلوات من التخزين المحلي للمحاكاة
    const prayersData = JSON.parse(localStorage.getItem('prayers_data') || '{}');
    
    // تحويل بيانات الصلوات من الكائن إلى مصفوفة
    const prayers = [];
    
    for (const userId in prayersData) {
        const userData = prayersData[userId];
        
        for (const date in userData) {
            const dayData = userData[date];
            
            for (const prayer in dayData) {
                if (dayData[prayer] && typeof dayData[prayer] === 'object') {
                    prayers.push({
                        id: Math.floor(Math.random() * 1000) + 1,
                        user_id: parseInt(userId),
                        prayer_name: prayer,
                        prayer_date: date,
                        prayer_time: dayData[prayer].time || '00:00:00',
                        status: dayData[prayer].status || 'on_time'
                    });
                }
            }
        }
    }
    
    // إذا كان الاستعلام يتضمن معرف مستخدم محدد
    if (params.length > 0 && query.includes('WHERE')) {
        const userId = parseInt(params[0]);
        
        // إضافة فلتر للتاريخ إذا كان موجودًا في الاستعلام
        if (params.length > 1 && query.includes('prayer_date')) {
            const date = params[1];
            return prayers.filter(prayer => 
                prayer.user_id === userId && 
                prayer.prayer_date === date
            );
        }
        
        return prayers.filter(prayer => prayer.user_id === userId);
    }
    
    return prayers;
}

// محاكاة استعلامات الأذكار
function simulateAdhkarQuery(query, params) {
    if (query.includes('adhkar_types')) {
        // محاكاة استعلام أنواع الأذكار
        const adhkarData = JSON.parse(localStorage.getItem('adhkar') || '{}');
        
        // تحويل بيانات الأذكار من الكائن إلى مصفوفة
        const adhkarTypes = [];
        let id = 1;
        
        for (const category in adhkarData) {
            const categoryAdhkar = adhkarData[category];
            
            for (const dhikr of categoryAdhkar) {
                adhkarTypes.push({
                    id: id++,
                    category: category,
                    arabic: dhikr.arabic,
                    translation: dhikr.translation,
                    count: dhikr.count
                });
            }
        }
        
        // إذا كان الاستعلام يتضمن فئة محددة
        if (params.length > 0 && query.includes('category')) {
            const category = params[0];
            return adhkarTypes.filter(dhikr => dhikr.category === category);
        } else if (params.length > 0 && query.includes('id')) {
            // محاكاة استعلام بواسطة المعرف
            const dhikrId = parseInt(params[0]);
            return adhkarTypes.filter(dhikr => dhikr.id === dhikrId);
        }
        
        return adhkarTypes;
    } else {
        // محاكاة استعلام الأذكار المسجلة
        const trackedAdhkar = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
        
        // تحويل بيانات الأذكار المسجلة إلى تنسيق قاعدة البيانات
        const adhkar = trackedAdhkar.map(item => ({
            id: Math.floor(Math.random() * 1000) + 1,
            user_id: parseInt(item.userId), // تحويل معرف المستخدم إلى رقم
            adhkar_id: parseInt(item.dhikrId), // تحويل معرف الذكر إلى رقم
            adhkar_type: item.category || 'general',
            adhkar_date: item.date,
            adhkar_time: '00:00:00',
            count: item.count
        }));
        
        // إذا كان الاستعلام يتضمن معرف مستخدم محدد
        if (params.length > 0 && query.includes('WHERE')) {
            const userId = parseInt(params[0]);
            
            if (params.length > 1 && query.includes('adhkar_type')) {
                // محاكاة استعلام بواسطة المستخدم والفئة
                const category = params[1];
                
                // إضافة فلتر للتاريخ إذا كان موجودًا في الاستعلام
                if (params.length > 2 && query.includes('adhkar_date')) {
                    const date = params[2];
                    return adhkar.filter(item => 
                        item.user_id === userId && 
                        item.adhkar_type === category &&
                        item.adhkar_date === date
                    );
                }
                
                return adhkar.filter(item => 
                    item.user_id === userId && 
                    item.adhkar_type === category
                );
            }
            
            return adhkar.filter(item => item.user_id === userId);
        }
        
        return adhkar;
    }
}

// محاكاة استعلامات الحكمة اليومية
function simulateWisdomQuery(query, params) {
    // استرجاع بيانات الحكمة اليومية من التخزين المحلي للمحاكاة
    const wisdomData = JSON.parse(localStorage.getItem('daily_wisdom') || '[]');
    
    // تحويل بيانات الحكمة اليومية إلى تنسيق قاعدة البيانات
    const wisdom = wisdomData.map((item, index) => ({
        id: index + 1,
        text: item.text,
        source: item.source
    }));
    
    // إذا كان الاستعلام يتضمن معرف محدد
    if (params.length > 0 && query.includes('WHERE')) {
        const wisdomId = params[0];
        return wisdom.filter(item => item.id === parseInt(wisdomId));
    }
    
    return wisdom;
}

// Get user prayer times
async function getUserPrayerTimes(userId) {
    try {
        // استعلام لجلب أوقات الصلاة للمستخدم
        const query = "SELECT * FROM prayer_times WHERE user_id = ?";
        const result = await executeQuery(query, [userId]);
        
        if (result.length > 0) {
            return result[0];
        } else {
            // إذا لم يكن للمستخدم أوقات صلاة محددة، استخدم الأوقات الافتراضية
            return getDefaultPrayerTimes();
        }
    } catch (error) {
        console.error('خطأ في جلب أوقات الصلاة للمستخدم:', error);
        
        // في حالة فشل الاتصال بقاعدة البيانات، استخدم البيانات المحلية كاحتياطي
        const userTimes = JSON.parse(localStorage.getItem(`prayer_times_${userId}`));
        
        if (!userTimes) {
            return JSON.parse(localStorage.getItem('default_prayer_times'));
        }
        
        return userTimes;
    }
}

// Set user prayer times
async function setUserPrayerTimes(userId, times) {
    try {
        // التحقق من وجود أوقات صلاة للمستخدم
        const checkQuery = "SELECT * FROM prayer_times WHERE user_id = ?";
        const existingTimes = await executeQuery(checkQuery, [userId]);
        
        if (existingTimes.length > 0) {
            // تحديث أوقات الصلاة الموجودة
            const updateQuery = `
                UPDATE prayer_times 
                SET fajr = ?, dhuhr = ?, asr = ?, maghrib = ?, isha = ?
                WHERE user_id = ?
            `;
            await executeQuery(updateQuery, [
                times.fajr,
                times.dhuhr,
                times.asr,
                times.maghrib,
                times.isha,
                userId
            ]);
        } else {
            // إنشاء أوقات صلاة جديدة
            const insertQuery = `
                INSERT INTO prayer_times (user_id, fajr, dhuhr, asr, maghrib, isha)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await executeQuery(insertQuery, [
                userId,
                times.fajr,
                times.dhuhr,
                times.asr,
                times.maghrib,
                times.isha
            ]);
        }
        
        console.log('تم حفظ أوقات الصلاة بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في حفظ أوقات الصلاة:', error);
        
        // في حالة فشل الاتصال بقاعدة البيانات، استخدم التخزين المحلي كاحتياطي
        localStorage.setItem(`prayer_times_${userId}`, JSON.stringify(times));
        return false;
    }
}

// Get default prayer times
async function getDefaultPrayerTimes() {
    try {
        // استعلام لجلب أوقات الصلاة الافتراضية
        const query = "SELECT * FROM prayer_times WHERE user_id = 0";
        const result = await executeQuery(query);
        
        if (result.length > 0) {
            return result[0];
        } else {
            // إذا لم تكن هناك أوقات صلاة افتراضية، أنشئ واحدة
            const defaultTimes = {
                fajr: '05:00',
                dhuhr: '12:00',
                asr: '15:30',
                maghrib: '18:00',
                isha: '19:30'
            };
            
            // إدخال أوقات الصلاة الافتراضية
            const insertQuery = `
                INSERT INTO prayer_times (user_id, fajr, dhuhr, asr, maghrib, isha)
                VALUES (0, ?, ?, ?, ?, ?)
            `;
            await executeQuery(insertQuery, [
                defaultTimes.fajr,
                defaultTimes.dhuhr,
                defaultTimes.asr,
                defaultTimes.maghrib,
                defaultTimes.isha
            ]);
            
            return defaultTimes;
        }
    } catch (error) {
        console.error('خطأ في جلب أوقات الصلاة الافتراضية:', error);
        
        // في حالة فشل الاتصال بقاعدة البيانات، استخدم التخزين المحلي كاحتياطي
        return JSON.parse(localStorage.getItem('default_prayer_times') || JSON.stringify({
            fajr: '05:00',
            dhuhr: '12:00',
            asr: '15:30',
            maghrib: '18:00',
            isha: '19:30'
        }));
    }
}

// Get random daily wisdom
async function getDailyWisdom() {
    try {
        // استعلام لجلب عدد الحكم اليومية
        const countQuery = "SELECT COUNT(*) as count FROM daily_wisdom";
        const countResult = await executeQuery(countQuery);
        
        if (countResult[0].count === 0) {
            return {
                text: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا',
                source: 'سورة النساء: 103'
            };
        }
        
        // اختيار حكمة عشوائية
        const randomId = Math.floor(Math.random() * countResult[0].count) + 1;
        
        // استعلام لجلب الحكمة العشوائية
        const wisdomQuery = "SELECT * FROM daily_wisdom WHERE id = ?";
        const wisdomResult = await executeQuery(wisdomQuery, [randomId]);
        
        if (wisdomResult.length > 0) {
            return wisdomResult[0];
        } else {
            // إذا لم يتم العثور على الحكمة، استخدم حكمة افتراضية
            return {
                text: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا',
                source: 'سورة النساء: 103'
            };
        }
    } catch (error) {
        console.error('خطأ في جلب الحكمة اليومية:', error);
        
        // في حالة فشل الاتصال بقاعدة البيانات، استخدم التخزين المحلي كاحتياطي
        const wisdomData = JSON.parse(localStorage.getItem('daily_wisdom') || '[]');
        
        if (wisdomData.length === 0) {
            return {
                text: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا',
                source: 'سورة النساء: 103'
            };
        }
        
        const randomIndex = Math.floor(Math.random() * wisdomData.length);
        return wisdomData[randomIndex];
    }
}

// Initialize local storage (كبديل مؤقت)
function initLocalStorage() {
    // التحقق من وجود مصفوفة المستخدمين في التخزين المحلي
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // التحقق من وجود بيانات الصلوات في التخزين المحلي
    if (!localStorage.getItem('prayers_data')) {
        localStorage.setItem('prayers_data', JSON.stringify({}));
    }
    
    // التحقق من وجود بيانات الأذكار في التخزين المحلي
    if (!localStorage.getItem('adhkar_data')) {
        localStorage.setItem('adhkar_data', JSON.stringify({}));
    }
    
    // التحقق من وجود بيانات الأذكار المسجلة في التخزين المحلي
    if (!localStorage.getItem('tracked_adhkar')) {
        localStorage.setItem('tracked_adhkar', JSON.stringify([]));
    }
    
    // التحقق من وجود أوقات الصلاة الافتراضية في التخزين المحلي
    if (!localStorage.getItem('default_prayer_times')) {
        localStorage.setItem('default_prayer_times', JSON.stringify({
            fajr: '05:00',
            dhuhr: '12:00',
            asr: '15:30',
            maghrib: '18:00',
            isha: '19:30'
        }));
    }
    
    // التحقق من وجود بيانات الحكمة اليومية في التخزين المحلي
    if (!localStorage.getItem('daily_wisdom')) {
        localStorage.setItem('daily_wisdom', JSON.stringify([
            {
                text: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا',
                source: 'سورة النساء: 103'
            },
            {
                text: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ',
                source: 'سورة البقرة: 238'
            },
            {
                text: 'وَأَقِمِ الصَّلَاةَ طَرَفَيِ النَّهَارِ وَزُلَفًا مِّنَ اللَّيْلِ إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ',
                source: 'سورة هود: 114'
            }
        ]));
    }
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.db = {
    init: initDatabase,
    executeQuery: executeQuery,
    getUserPrayerTimes: getUserPrayerTimes,
    setUserPrayerTimes: setUserPrayerTimes,
    getDailyWisdom: getDailyWisdom,
    getUserPrayerStats: getUserPrayerStats,
    getUserAdhkarStats: getUserAdhkarStats,
    savePrayer: savePrayer,
    saveAdhkar: saveAdhkar
};

// Run database initialization
document.addEventListener('DOMContentLoaded', initDatabase);
