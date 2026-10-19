## 题目描述

输入一个字符串数组，需要将 **字母异位词** 组合在一起。可以按任意顺序返回结果列表。

字母异位词：重新排列原单词或短语的所有字母得到的单词或短语，且每个原字母只能使用一次。

示例 1：
> **输入**: `strs = ["eat", "tea", "tan", "ate", "nat", "bat"]`
> 
> **输出**: `[["bat"],["nat","tan"],["ate","eat","tea"]]`
> 
> **解释**：
> - 在 strs 中没有字符串可以通过重新排列来形成 "bat"。
> - 字符串 "nat" 和 "tan" 是字母异位词，因为它们可以重新排列以形成彼此。
> - 字符串 "ate" ，"eat" 和 "tea" 是字母异位词，因为它们可以重新排列以形成彼此。

示例 2：
> **输入**: strs = [""]
> 
> **输出**: [[""]]

示例 3：
> **输入**: strs = ["a"]
> 
> **输出**: [["a"]]

提示；
- 1 <= `strs.length` <= $10^4$
- 0 <= `strs[i].length` <= 100
- `strs[i]` 仅包含小写字母

## 哈希

这道题比较简单，使用哈希可以快速找到同类词，关键在于如何将字母异位词构建为相同的键进行映射。考虑到字母异位词仅字母的顺序发生了改变，故主要有两种方法：

### 排序

可以将每个词的字母进行排序，这样同类词排序后会相同且唯一

设词最大长度为 k，则单个词排序的时间复杂度为 $O(k\log{k})$；设共有 n 个词，哈希操作时间复杂度设为 $O(1)$，则总的时间复杂度为 $O(nk\log{k})$。空间复杂度为 $O(nk)$

代码示例：
```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> res;
        for (auto& str : strs) {
            string key = str;
            sort(key.begin(), key.end());
            res[key].emplace_back(str);
        }
        vector<vector<string>> ans;
        for (auto& pair : res) {
            ans.emplace_back(pair.second);
        }
        return ans;
    }
};
```

### 计数

不同类词的不同字母数量唯一，可以对各个字母进行计数，以此作为键值进行哈希映射

考虑哈希映射的时间复杂度为 $O(\epsilon)$，则总的时间复杂度为 $O(n(k+\epsilon))$
